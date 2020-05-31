let myChart = document.getElementById('myChart').getContext('2d');

// Global Options
Chart.defaults.global.defaultFontFamily = 'Lato';
Chart.defaults.global.defaultFontSize = 18;
Chart.defaults.global.defaultFontColor = '#777';

let massPopChart = new Chart(myChart, {
  type: 'pie', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
  data: {
    labels: [

    'AGRICULTURE',
    'ALPHABETISATION',
    'ARTISANAT',
    'FORETS',
    'TRANSPORT',
    'CENTRES DE GESTION',
    'PLANTES MEDICINALES ET AROMATIQUES',
    'DENREES ALIMENTAIRES',
    'COMMERCANTS DETAILLANTS',
    'TOURISME',
    'ARGANE',
    'ART ET CULTURE',
    'EXPLOITATION DES CARRIERES',
    'MAIN D’OEUVRE',
    'PECHE',
    'TELECOMMUNICATION',
    'TRAITEMENT DE DECHETS',
    'COMMERCE ELECTRONIQUE'
  ],


    datasets: [{
      label: 'Population',
      data: [
        152,
        122,
        21,
        21,
        15,
        13,
        9,
        5,
        3,
        2,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1
      ],
      //backgroundColor:'green',
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)'

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
      text: 'Les coopératives des lauréats diplômés par secteur (fin décembre 2015)',
      fontSize: 25
    },
    legend: {
      display: true,
      position: 'right',
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
