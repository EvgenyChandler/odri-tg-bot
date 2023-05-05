build:
	docker build -t odri-bot .

run:
	docker run -d -p 3000:3000 --log-driver=json-file --log-opt max-size=5m --log-opt max-file=1 --restart=unless-stopped --network host --name odri-tg-bot odri-bot