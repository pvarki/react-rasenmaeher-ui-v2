######################
# Base builder image #
######################
FROM node:24-bookworm AS builder_base

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
RUN corepack enable && corepack prepare pnpm@11.1.0 --activate

SHELL ["/bin/bash", "-lc"]


####################################
# Base stage for production builds #
####################################
FROM builder_base AS production_build
COPY ./docker/entrypoint.sh /docker-entrypoint.sh
WORKDIR /app
COPY . /app

# Set the VITE_THEME environment variable during the build
ARG VITE_THEME=default
ENV VITE_THEME=$VITE_THEME

# Set release tag so we can show our deployment version to users
ARG VITE_RELEASE_TAG=Developing
ENV VITE_RELEASE_TAG=$VITE_RELEASE_TAG

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile \
    && chmod a+x /docker-entrypoint.sh \
    && pnpm run build \
    && true


#########################
# Main production build #
#########################
FROM bash:latest AS production
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
FROM nginxinc/nginx-unprivileged:stable AS k8s_nginx
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=production_build /app/dist /usr/share/nginx/html

#####################################
# Base stage for development builds #
#####################################
FROM builder_base AS devel_build
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node ./package.json ./pnpm-lock.yaml /app/

RUN pnpm install --ignore-scripts --frozen-lockfile


############
# DevSpace #
############
FROM devel_build AS dev
WORKDIR /app
COPY --chown=node:node . /app

ARG VITE_THEME=default
ENV VITE_THEME=$VITE_THEME

EXPOSE 8080
CMD ["pnpm", "exec", "vite", "--host", "0.0.0.0", "--port", "8080"]


###########
# Hacking #
###########
FROM devel_build AS devel_shell
# Copy everything to the image
WORKDIR /app
COPY . /app
RUN apt-get update && apt-get install -y zsh \
    && sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" \
    && echo "source /root/.profile" >>/root/.zshrc \
    && true


ENTRYPOINT ["/bin/zsh", "-l"]
