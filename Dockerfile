######################
# Base builder image #
######################
FROM node:22-bookworm as builder_base

ENV \
  # locale
  LC_ALL=C.UTF-8


RUN apt-get update && apt-get install -y \
        curl \
        git \
        bash \
        build-essential \
        tini \
        openssh-client \
        cargo \
        jq \
        python3-pip \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* \
    # githublab ssh
    && mkdir -p -m 0700 ~/.ssh && ssh-keyscan gitlab.com github.com | sort > ~/.ssh/known_hosts \
    && true

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26 --activate

SHELL ["/bin/bash", "-lc"]


######################################################
# Optional: Build product integration UIs (mock mode) #
######################################################
FROM builder_base as integration_builder
WORKDIR /integrations

# Copy product integration UI sources (when available via build context)
# These are only needed for mock/demo builds, not production
COPY ./integrations/ /integrations/

# Build each product integration that exists
RUN for product_dir in /integrations/*/ui; do \
      if [ -d "$product_dir" ] && [ -f "$product_dir/package.json" ]; then \
        shortname=$(basename $(dirname "$product_dir")); \
        echo "Building integration: $shortname"; \
        cd "$product_dir" && pnpm install && pnpm build:mock || true; \
        mkdir -p /integration_builds/$shortname; \
        if [ -d "$product_dir/dist" ]; then \
          cp -r "$product_dir/dist/"* /integration_builds/$shortname/; \
        fi; \
        if [ -f "$product_dir/public/product-manifest.json" ]; then \
          cp "$product_dir/public/product-manifest.json" /integration_builds/$shortname/; \
        fi; \
      fi; \
    done \
    && true


####################################
# Base stage for production builds #
####################################
FROM builder_base as production_build
COPY ./docker/entrypoint.sh /docker-entrypoint.sh
WORKDIR /app
COPY . /app

# Set the VITE_THEME environment variable during the build
ARG VITE_THEME=default
ENV VITE_THEME=$VITE_THEME

# Set release tag so we can show our deployment version to users
ARG VITE_RELEASE_TAG=Developing
ENV VITE_RELEASE_TAG=$VITE_RELEASE_TAG

# Optionally copy pre-built integration UIs for mock builds
ARG INCLUDE_INTEGRATIONS=false
COPY --from=integration_builder /integration_builds/ /tmp/integration_builds/
RUN if [ "$INCLUDE_INTEGRATIONS" = "true" ] && [ -d /tmp/integration_builds ]; then \
      mkdir -p /app/public/ui; \
      cp -r /tmp/integration_builds/* /app/public/ui/ 2>/dev/null || true; \
      node /app/scripts/generate-integrations-json.js 2>/dev/null || true; \
    fi

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile \
    && chmod a+x /docker-entrypoint.sh \
    && pnpm run build \
    && true


#########################
# Main production build #
#########################
FROM bash:latest as production
WORKDIR /app
COPY --from=production_build /docker-entrypoint.sh /docker-entrypoint.sh
COPY --from=production_build /app/dist /dist
# Copy build things from production_build so this production image can stay minimalis
RUN chmod a+x /docker-entrypoint.sh \
    && mkdir /deliver \
    && true
ENTRYPOINT ["/docker-entrypoint.sh"]

########################
# K8S Nginx deployment #
########################
FROM nginx:stable AS k8s_nginx
COPY --from=production_build /app/dist /usr/share/nginx/html

#####################################
# Base stage for development builds #
#####################################
FROM builder_base as devel_build
WORKDIR /app
COPY ./package.json ./pnpm-lock.yaml /app/

RUN pnpm install --include=dev --ignore-scripts


###########
# Hacking #
###########
FROM devel_build as devel_shell
# Copy everything to the image
WORKDIR /app
COPY . /app
RUN apt-get update && apt-get install -y zsh \
    && sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" \
    && echo "source /root/.profile" >>/root/.zshrc \
    && true


ENTRYPOINT ["/bin/zsh", "-l"]
