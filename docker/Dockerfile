FROM node:current-alpine
COPY package.json /app/package.json
RUN cd /app; npm install --production
WORKDIR /app
CMD ["node", "dist/main.cjs"]
EXPOSE 8080
