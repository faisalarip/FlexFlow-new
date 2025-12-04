#!/bin/bash
set -e

# Install all dependencies including devDependencies
npm ci --include=dev

# Run the build
npm run build
