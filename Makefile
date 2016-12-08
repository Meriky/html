RESULTS=output/multipage/*.html output/*.html output/*.js

update-source:
	[ -d html ] || git clone https://github.com/whatwg/html.git --depth=1
	cd html && git pull && cd ..
	mv html/source source

build-en: clean-en
	node ./bin/split.js

build-zh:
	node ./bin/merge.js > html/source
	[ -d html-build ] || git clone https://github.com/whatwg/html-build.git --depth=1
	HTML_OUTPUT=$(abspath output) bash html-build/build.sh -n
	sed -i \
		-e 's/"\/\?multipage/"\/html\/multipage/g' \
		-e "s/'\/\?multipage/'\/html\/multipage/g" \
		-e 's/=\/\?link-fixup.js/=\/html\/link-fixup.js/g' \
		-e "s/'\/\?fonts\//'\/html\/fonts\//g" \
		-e 's/=\/\?images\//=\/html\/images\//g' \
		-e 's/=\/\?demos\//=\/html\/demos\//g' \
		-e 's/=\/\?entities.json/=\/html\/entities.json/g' \
		$(RESULTS)
	cat ./output/multipage/fragment-links.json | node ./bin/json-pretify.js > /tmp/a.json
	cat /tmp/a.json > ./output/multipage/fragment-links.json

deploy:
	@echo Make sure output/ has been committed into master branch
	git subtree push --prefix=output --squash origin gh-pages

deploy-force:
	git push origin `git subtree split --prefix output master`:gh-pages --force

clean-en:
	rm -rf src/SUMMARY.en.md
	find src/ -name "*.en.html" -delete
	find src/ -type d -empty -delete

clean-cache:
	rm -rf html-build/.cache

update-term:
	node ./bin/update-term.js
