Chart.defaults.global.defaultFontFamily = "'PT Sans', sans-serif";
Chart.defaults.global.defaultFontSize = 16;
Chart.defaults.global.responsive = true;
Chart.defaults.global.maintainAspectRatio = false;
Chart.defaults.global.legend.display = false;

function setBasicOptions(chart_type) {
	var options = {
		scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
	   	}
	};
	return options;
}