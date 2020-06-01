let myChart2 = document.getElementById('myChart2').getContext('2d');

// Global Options
Chart.defaults.global.defaultFontFamily = 'Lato';
Chart.defaults.global.defaultFontSize = 18;
Chart.defaults.global.defaultFontColor = '#777';

let massPopChart = new Chart(myChart2, {
  type: 'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
  data: {
    labels: [
               "Agriculture",
               "Artisanat",
               "Tourisme",
               "Argan",
               "Art et culture",
               "Mines",
               "Habitat"
    ],

    datasets: [{
      label: 'cooperatives',
      data: [ 100, 200, 300, 400, 500, 600, 700 ],
      //backgroundColor:'green',
      backgroundColor: [
        '#130061',
        '#1F006C',
        '#2B0077',
        '#370082',
        '#44008D',
        '#500097',
        '#5C00A2',
        '#6800AD',
        '#7400B8',
        '#851AC1',
        '#9734CA',
        '#A84ED3',
        '#BA69DC',
        '#CB83E4',
        '#DC9DED',
        '#EEB7F6',
        '#FFD1FF',
        '#130061',
        '#1F006C',
        '#2B0077',
        '#370082',
      ],
      borderWidth: 1,
      borderColor: '#777',
      hoverBorderWidth: 3,
      hoverBorderColor: '#000'
    }]
  },
  options: {
    title: {
      display: true,
      text: "Nombre de coopératives par secteurs d'activités",
      fontSize: 25
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        fontColor: '#000'
      }
    },
    layout: {
      padding: {
        left: 50,
        right: 0,
        bottom: 0,
        top: 0
      }
    },
    tooltips: {
      enabled: true
    }
  }
});
