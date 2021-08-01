FROM node:16-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
RUN yarn build
CMD ["yarn", "serve"]
EXPOSE 8080
