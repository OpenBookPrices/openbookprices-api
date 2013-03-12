all: node-modules

node-modules:
	npm install
	npm prune

jshint:
	node_modules/.bin/jshint --config config/jshint-node.json .

test: jshint
	mocha

PHONY: node-modules test jshint
