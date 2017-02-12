amazecreationz.constants = {
	mainTabs:[{
		id: 'home',
		name:'Home',
		icon: 'home',
		state: 'home',
		permission: 5
	},{
		id: 'apps',
		name:'Applications',
		icon: 'apps',
		state: 'apps({type: ""})',
		permission: 5
	},{
		id: 'contact',
		name:'Get in Touch',
		icon: 'contacts',
		state: 'contact',
		permission: 0
	}],
	apps: [{
		id: 'GPACalculator',
		name: 'GPA Calculator',
		description: 'Calculates GPA of NITC students from Gradecard PDF.',
		template: '/modules/applications/gpa-calculator.html',
		page: true,
		icon: 'school',
		bck_image: 'nitc.jpg',
		priority: 2,
		links: {
			github: 'https://github.com/amazecreationz/GPACalculator',
			playstore: 'https://play.google.com/store/apps/details?id=com.kkroo.dheeraj.nitcgpa&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'
		},
		contributer: {
			name: 'Dheeraj MA',
			designation: 'Android Application Developer',
			image_url: 'dheerajma.jpg',
			contact: 'dheerajma007@gmail.com'
		}
	},{
		id: 'SmartTV',
		name: 'Smart TV',
		description: 'Turn your old dumb TV into Smart TV using Raspberry Pi.',
		template: '/modules/applications/smarttv.html',
		page: false,
		icon: 'tv',
		priority: 0,
		links: {
			github: 'https://github.com/amazecreationz/SmartTV',
		},
		tags: [
			{
				title: 'Under Development',
				color: '#CDDC39'
			}
		]
	},{
		id: 'GDriveSync',
		name: 'GDrive Sync',
		description: 'Sync your folders in Computer and in Android with Google Drive Cloud.',
		template: '/modules/applications/gdrive-sync.html',
		page: true,
		icon: 'cloud_done',
		priority: 1,
		links: {
			github: 'https://github.com/amazecreationz/GDriveSync',
		},
		tags: [
			{
				title: 'Under Development',
				color: '#CDDC39'
			}
		]
	},{
		id: 'Messenger',
		name: 'Messenger',
		description: 'Android messaging app that enables you to schedule text and Whatsapp messages.',
		template: '/modules/applications/messenger.html',
		page: false,
		icon: 'message',
		priority: 0,
		links: {
			github: 'https://github.com/amazecreationz/Messenger',
		},
		tags: [
			{
				title: 'Under Development',
				color: '#CDDC39'
			}
		]
	},{
		id: 'Connected',
		name: 'Connected',
		description: 'Sync your Music, Videos and Files between your Computer and your Android wirelessly.',
		template: '/modules/applications/connected.html',
		page: true,
		icon: 'beenhere',
		priority: 1,
		links: {
			github: 'https://github.com/amazecreationz/Connected',
		},
		tags: [
			{
				title: 'Under Development',
				color: '#CDDC39'
			}
		]
	}],
	crewList: [{
		name: 'Anand Mohan',
		designation: 'Developer',
		image_url: 'anandmoghan.jpg',
		contact: 'anandmoghan@amazecreationz.in'
	}],
	about: {
		hosting_list: [{
			name: 'GoDaddy',
			image_url: 'godaddy.jpg',
			url: 'https://in.godaddy.com'
		},{
			name: 'OpenShift',
			image_url: 'openshift.jpg',
			url: 'https://www.openshift.com'
		},{
			name: 'Zoho',
			image_url: 'zoho.jpg',
			url: 'https://www.zoho.com'
		}]
	}
}