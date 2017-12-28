FROM node:8

WORKDIR /app
COPY . .

# If you have native dependencies, you'll need extra tools
# RUN apk add --no-cache make gcc g++ python

RUN npm install
RUN npm run bower
RUN npm run build

# RUN curl -o- -L https://yarnpkg.com/install.sh | bash
# RUN yarn --pure-lockfile
# RUN node ./node_modules/bower/bin/grunt build
# RUN node ./node_modules/bower/bin/grunt build
# RUN node ./node_modules/bower/bin/bower install
# RUN grunt build

EXPOSE 8888
CMD ["npm", "start"]