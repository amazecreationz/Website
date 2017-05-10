application.constants = {
	tabs: [{
		id: 'home',
		name:'Home',
		title: 'Amaze Creationz | Home',
		icon: 'home',
		state: 'home',
		permission: application.permissions.VISITOR
	},{
		id: 'apps',
		name:'Applications',
		title: 'Amaze Creationz | Applications',
		icon: 'apps',
		state: 'apps',
		stateParams: {type: null},
		permission: application.permissions.VISITOR
	},{
		id: 'console',
		name:'Console',
		title: 'Amaze Creationz | Console',
		icon: 'computer',
		state: 'console',
		permission: application.permissions.MANAGER
	},/*{
		id: 'profile',
		name:'My Profile',
		title: 'Amaze Creationz | My Profile',
		icon: 'face',
		state: 'profile',
		permission: application.permissions.USER
	},*/{
		id: 'about',
		name:'About',
		title: 'Amaze Creationz | About Us',
		icon: 'info_outline',
		state: 'about',
		permission: application.permissions.VISITOR
	},{
		id: 'contact',
		name:'Get In Touch',
		title: 'Amaze Creationz | Get In Touch',
		icon: 'contacts',
		state: 'contact',
		permission: application.permissions.VISITOR
	}],
	crew:{
		anandmoghan: {
			level: 0,
			image: 'anandmoghan.jpg',
			name: 'Anand Mohan',
			email: 'anandmoghan@amazecreationz.in',
			designation: 'Developer',
			location: 'Trivandrum, India',
			skills: ['HTML5', 'CSS3', 'JavaScript', 'Java', 'AngularJS', 'jQuery', 'NodeJS', 'Firebase']
		},
		dheerajma007: {
			level: 1,
			image: 'dheerajma007.jpg',
			name: 'Dheeraj M A',
			email: 'dheerajma007@gmail.com',
			designation: 'Developer',
			location: 'Bangalore, India',
			skills: ['Java', 'Android']
		}
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
		description: 'Keep track of your employee\'s attendance and payments.',
		page: 'employee-meter.html',
		showPage: true,
		links: {
			github: 'https://github.com/amazecreationz/EmployeeMeter',
		},
		development: {
			git: 'EmployeeMeter',
			contributors: ['anandmoghan']
		},
		tags: [
			{
				title: 'beta',
				color: '#E53935'
			}
		]
	},{
		priority: -1,
		id: 'Ideas',
		icon: 'lightbulb_outline',
		name: 'Have an Idea?',
		description: 'Write to us at <a href="mailto:ideas@amazecreationz.in">ideas@amazecreationz.in</a>.<br>We will make it happen. :)',
		showPage: false,
	}]
}