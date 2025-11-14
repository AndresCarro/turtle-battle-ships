FROM node:lts-bookworm AS builder

# Install dependencies required for chromium
RUN apt-get update && apt-get install -y \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libgbm-dev \
  libasound2 \
  libxrandr2 \
  libxkbcommon-dev \
  libxfixes3 \
  libxcomposite1 \
  libxdamage1 \
  libatk-bridge2.0-0 \
  libcups2 \
  cmake \
  fonts-noto-color-emoji

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install aws-lambda-ric

COPY . .

RUN mkdir -p renders

# Install browser
RUN npx remotion browser ensure

RUN npm run build

FROM node:lts-bookworm

RUN apt-get update && apt-get install -y \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libgbm-dev \
  libasound2 \
  libxrandr2 \
  libxkbcommon-dev \
  libxfixes3 \
  libxcomposite1 \
  libxdamage1 \
  libatk-bridge2.0-0 \
  libcups2 \
  fonts-noto-color-emoji

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

RUN npx remotion browser ensure

COPY --from=builder /app/dist/ ./

COPY --from=builder /app/build/ ./build/

ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD ["index.handler"]
