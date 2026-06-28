export async function createRssFeed(baseUrl, magnetInfo, request) {
	const offset = Number.parseInt(request.offset, 10) || 0;
	const total = magnetInfo.length;

	const feedObject = {
		rss: [
			{
				_attr: {
					version: '2.0',
					'xmlns:atom': 'http://www.w3.org/2005/Atom',
					'xmlns:torznab': 'http://torznab.com/schemas/2015/feed',
				},
			},
			{
				channel: [
					{
						'atom:link': {
							_attr: {
								href: baseUrl,
								rel: 'self',
								type: 'application/rss+xml',
							},
						},
					},
					{
						title: 'TamilMV RSS',
					},
					{
						link: baseUrl,
					},
					{description: 'TamilMV RSS Generator Developed By Febin Baiju'},
					{
						'torznab:response': {
							_attr: {
								offset,
								total,
							},
						},
					},
					{
						language: 'en-US',
					},
					{
						category: 2000,
					},
					...(magnetInfo.map(post => {
						const feedItem = {
							item: [
								{title: post.name},
								{
									description: {
										_cdata: post.name,
									},
								},
								{
									link: post.torrentPath,
								},
								{
									guid: [
										{_attr: {isPermaLink: 'false'}},
										post.guid,
									],
								},
								{
									pubDate: post.publishedDate,
								},
								{
									enclosure: {
										_attr: {
											url: post.torrentPath,
											type: 'application/x-bittorrent',
											length: post.torrentSize || '10000',
										},
									},
								},
								{comments: post.name},
								{'torznab:attr': {_attr: {name: 'magneturl', value: post.magnet}}},
								{
									'torznab:attr': {_attr: {name: 'seeders', value: 10}},
								},
								{
									'torznab:attr': {
										_attr: {name: 'leechers', value: 10},
									},
								},
								{
									'torznab:attr': {
										_attr: {name: 'size', value: post.torrentSize || '0'},
									},
								},
								{
									'torznab:attr': {
										_attr: {name: 'category', value: '2000'},
									},
								},
							],
						};
						return feedItem;
					})),
				],
			},
		],
	};
	return feedObject;
}

export async function torznabTest() {
	const xmlString = {
		caps: [
			{
				server: {
					_attr: {
						version: '1.0',
						title: 'TamilMV Torznab',
						image: 'https://download.epson-europe.com/logo/true_epsonlogo.jpg',
					},
				},
			},
			{limits: {_attr: {max: '100', default: 50}}},
			{registration: {_attr: {available: 'no', open: 'no'}}},
			{
				searching: [
					{search: {_attr: {available: 'yes'}}},
					{
						'movie-search': {
							_attr: {available: 'yes', supportedParams: 'q'},
						},
					},
				],
			},
			{
				categories: [
					{
						category: [
							{_attr: {id: '2000', name: 'Movies'}},
							{category: {_attr: {id: '2010', name: 'Movies/Foreign'}}},
							{category: {_attr: {id: '2030', name: 'Movies/HD'}}},
							{category: {_attr: {id: '2040', name: 'Movies/SD'}}},
						],
					},
				],
			},
		],
	};

	return xmlString;
}

export async function noTopics(baseUrl) {
	const feedObject = {
		rss: [
			{
				_attr: {
					version: '2.0',
					'xmlns:atom': 'http://www.w3.org/2005/Atom',
					'xmlns:torznab': 'http://torznab.com/schemas/2015/feed',
				},
			},
			{
				channel: [
					{
						'atom:link': {
							_attr: {
								href: baseUrl,
								rel: 'self',
								type: 'application/rss+xml',
							},
						},
					},
					{
						title: 'TamilMV RSS',
					},
					{
						link: baseUrl,
					},
					{description: 'TamilMV RSS Generator Developed By Febin Baiju'},
					{
						'torznab:response': {
							_attr: {
								offset: 0,
								total: 0,
							},
						},
					},
				],
			},
		],
	};
	return feedObject;
}
