let myChart = document.getElementById('myChart').getContext('2d');

// Global Options
Chart.defaults.global.defaultFontFamily = 'Lato';
Chart.defaults.global.defaultFontSize = 18;
Chart.defaults.global.defaultFontColor = '#777';

let massPopChart = new Chart(myChart, {
  type: 'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
  data: {
    labels: [

      'Laayoune-Assakia Al hamra',
      'Souss-Massa',
      'Marrakech-Safi',
      'Fès-Meknès',
      'Tanger-Tétouan-Al hoceima',
      'Guelmim-oued noun',
      'Beni Mellal-Khenifra',
      'Oriental',
      'Draa-Tafilalet',
      'Casablanca-Settat',
      'Rabat-Salé-Kénitra',
      'Eddakhla-Oued Eddahab'

],

    datasets: [{
      label: 'Nombre de coopératives',
      data: [
          '393',
          '352',
          '227',
          '226',
          '216',
          '199',
          '133',
          '129',
          '129',
          '127',
          '107',
          '42'
      ],
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
      text: 'Coopératives de femmes par région (fin décembre 2015)',
      fontSize: 25,
      padding: 20
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
