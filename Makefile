build:
	docker build -t odri-bot .

run:
	docker run -d -p 3000:3000 --restart=unless-stopped --network host --name odri-tg-bot odri-bot