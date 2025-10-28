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
RUN corepack enable

SHELL ["/bin/bash", "-lc"]


####################################
# Base stage for production builds #
####################################
FROM builder_base as production_build
COPY ./docker/entrypoint.sh /docker-entrypoint.sh
WORKDIR /app
COPY . /app

# Set the VITE_ASSET_SET environment variable during the build
ARG VITE_ASSET_SET=neutral
ENV VITE_ASSET_SET=$VITE_ASSET_SET

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
FROM bash:latest as production
WORKDIR /app
COPY --from=production_build /docker-entrypoint.sh /docker-entrypoint.sh
COPY --from=production_build /app/dist /dist
# Copy build things from production_build so this production image can stay minimalis
RUN chmod a+x /docker-entrypoint.sh \
    && mkdir /deliver \
    && true
ENTRYPOINT ["/docker-entrypoint.sh"]


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
