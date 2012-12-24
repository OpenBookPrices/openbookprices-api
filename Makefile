all: node-modules

node-modules:
	npm install
	npm prune

jshint:
	node_modules/.bin/jshint --config config/jshint-node.json *.js

test: jshint

PHONY: node-modules test jshint
