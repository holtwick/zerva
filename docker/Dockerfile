FROM node
COPY package.json /app/package.json
RUN cd /app; npm install --production
WORKDIR /app
CMD ["node", "dist/main.mjs"]
EXPOSE 8080
