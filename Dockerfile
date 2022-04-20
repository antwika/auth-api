# Build step
FROM node:lts-alpine AS BUILD
WORKDIR /build
COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile
COPY src ./src
COPY test ./test
COPY .eslintrc.json .
COPY jest.config.js .
COPY tsconfig.json .
RUN yarn lint
RUN yarn build
RUN yarn test

# Runtime
FROM node:lts-alpine
RUN apk --no-cache add curl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=BUILD /build/package.json .
COPY --from=BUILD /build/yarn.lock .
RUN yarn install --production --frozen-lockfile
COPY config ./config
COPY --from=BUILD /build/dist ./dist
EXPOSE 8080
CMD ["yarn", "start"]
