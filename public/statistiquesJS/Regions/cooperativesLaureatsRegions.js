let myChart = document.getElementById('myChart').getContext('2d');

// Global Options
Chart.defaults.global.defaultFontFamily = 'Lato';
Chart.defaults.global.defaultFontSize = 18;
Chart.defaults.global.defaultFontColor = '#777';

let massPopChart = new Chart(myChart, {
  type: 'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
  data: {
    labels: [
      'Fès-Meknès',
      'Oriental',
      'Rabat-Salé-Kénitra',
      'Tanger-Tétouan-Al hoceima',
      'Beni Mellal-Khenifra',
      'Draa-Tafilalet',
      'Marrakech-Safi',
      'Souss-Massa',
      'Guelmim-oued noun',
      'Casablanca-Settat',
      'Laayoune-Assakia Al hamra',

],

    datasets: [{
      label: 'Nombre de coopératives',
      data: [
        '73',
        '72',
        '49',
        '38',
        '38',
        '28',
        '20',
        '16',
        '14',
        '14',
        '9'
      ],
      //backgroundColor:'green',
      backgroundColor: [

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
      text: 'Coopératives des lauréats diplômés par région (fin décembre 2015)',
      fontSize: 25,
      padding: 20 ,
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
    },
    scales: {
    xAxes: [{
        ticks: {
        maxRotation: 40,
        minRotation: 30,
        padding: 10,
        autoSkip: false,
        fontSize: 15
      }
    }],
    yAxes: [{
        ticks: {
        maxRotation: 0,
        minRotation: 0,
        padding: 10,
        autoSkip: false,
        fontSize: 15
      }
    }]
  }
  }
});
