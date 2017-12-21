application.constants = {
	tabs: [{
		id: 'home',
		name:'Home',
		title: 'Amaze Creationz | Home',
		icon: 'home',
		state: 'home',
		p: application.permissions.VISITOR
	},{
		id: 'apps',
		name:'Applications',
		title: 'Amaze Creationz | Applications',
		icon: 'apps',
		state: 'apps',
		stateParams: {type: null},
		p: application.permissions.VISITOR
	},{
		id: 'profile',
		name:'Profile',
		title: 'Amaze Creationz | Profile',
		icon: 'face',
		state: 'profile',
		p: application.permissions.USER
	},{
		id: 'console',
		name:'Console',
		title: 'Amaze Creationz | Console',
		icon: 'computer',
		state: 'console',
		p: application.permissions.MANAGER
	},/*{
		id: 'settings',
		name:'Site Settings',
		title: 'Amaze Creationz | Site Settings',
		icon: 'settings',
		state: 'settings',
		p: application.permissions.USER
	},*/{
		id: 'about',
		name:'About',
		title: 'Amaze Creationz | About Us',
		icon: 'info_outline',
		state: 'about',
		p: application.permissions.VISITOR
	},{
		id: 'contact',
		name:'Get In Touch',
		title: 'Amaze Creationz | Get In Touch',
		icon: 'contacts',
		state: 'contact',
		p: application.permissions.VISITOR
	}],
	team: {
		levels: [{
			id: 'level0',
			name: 'Level 0',
			value: 0
		},{
			id: 'l1',
			name: 'Level 1',
			value: 1
		},{
			id: 'l2',
			name: 'Level 2',
			value: 2
		},{
			id: 'l3',
			name: 'Level 3',
			value: 3
		},{
			id: 'l4',
			name: 'Level 4',
			value: 4
		}],
		types: [{
			id: 'EMPLOYEE',
			name: 'Employee'
		},{
			id: 'CONTRIBUTOR',
			name: 'Contributor'
		}]
	},
	apps: [{
		priority: 2,
		id: 'GPACalculator',
		icon: 'school',
		name: 'GPA Calculator',
		description: 'Calculates GPA of NITC students from Gradecard PDF.',
		page: 'gpa-calculator.html',
		showPage: true,
		background: 'nitc.jpg',
		links: {
			facebook: 'https://www.facebook.com/GPACalculator',
			github: 'https://github.com/amazecreationz/GPACalculator',
			playstore: 'https://play.google.com/store/apps/details?id=com.kkroo.dheeraj.nitcgpa&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'
		},
		development: {
			git: 'GPACalculator',
			contributors: ['anandmoghan', 'dheerajma007']
		}
	},{
		priority: 1,
		id: 'EmployeeMeter',
		icon: 'supervisor_account',
		name: 'Employee Meter',
		description: 'Monitor your personal employee\'s attendance and payments from anywhere.',
		page: 'employee-meter.html',
		showPage: true,
		dev: 'BETA',
		links: {
			github: 'https://github.com/amazecreationz/EmployeeMeter'
		},
		development: {
			git: 'EmployeeMeter',
			contributors: ['anandmoghan']
		}
	},{
		priority: 3,
		id: 'ASYNC',
		icon: 'cloud_done',
		name: 'Async',
		description: 'Hassle free sync of your files and media across all your connected devices.',
		page: 'async.html',
		showPage: true,
		dev: 'ALPHA',
		links: {
			github: 'https://github.com/amazecreationz/Async',
			playstore: 'https://play.google.com/store/apps/details?id=com.amazecreationz.async'
		},
		development: {
			git: 'Async',
			contributors: ['anandmoghan']
		}
	},{
		priority: 4,
		id: 'pDairy',
		icon: 'book',
		name: 'P-Dairy',
		description: 'Private and secure dairy at your finger-tips.',
		page: 'pDairy.html',
		showPage: false,
		development: {
			contributors: ['anandmoghan']
		},
		tags: [
			{
				title: 'Coming Soon',
				theme: 'cyan'
			}
		]
	}],
	query: {
		types: [{
			id: 'query',
			name: 'General Query'
		}, {
			id: 'support',
			name: 'Support'
		}, {
			id: 'feedback',
			name: 'Feedback'
		}]
	}
}