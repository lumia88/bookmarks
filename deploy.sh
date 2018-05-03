#!/bin/bash

# @Author: nooldey
# @Date:   2018-04-28 09:08:12
# @Last Modified by:   nooldey
# @Last Modified time: 2018-05-03 20:36:47

yarn build
cd public
git init
git add .
git commit -m 'deploy'
git remote add pages https://github.com/nooldey/bookmarks.git -t gh-pages
git push -u -f pages HEAD:gh-pages