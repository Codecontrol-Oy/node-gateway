
FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/node-gateway
WORKDIR /usr/src/node-gateway

# Install app dependencies
COPY package.json /usr/src/controlit-api-gateway/

#Install dependencies
RUN npm install

# Bundle app source
COPY . /usr/src/node-gateway/

#expose port
EXPOSE 6010

#Run
CMD [ "node", "./examples/exampleGateway.js" ]