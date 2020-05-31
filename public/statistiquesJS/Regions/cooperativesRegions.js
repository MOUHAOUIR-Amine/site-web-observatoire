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
'Casablanca-Settat',
'Rabat-Salé-Kénitra',
'Tanger-Tétouan-Al hoceima',
'Marrakech-Safi',
'Souss-Massa',
'Laayoune-Assakia Al hamra',
'Oriental',
'Beni Mellal-Khenifra',
'Guelmim-oued noun',
'Draa-Tafilalet',
'Eddakhla-Oued Eddahab'
],

    datasets: [{
      label: 'Nombre de coopératives',
      data: [
        '1835',
        '1780',
        '1667',
        '1486',
        '1407',
        '1395',
        '1293',
        '1215',
        '1203',
        '1157',
        '999',
        '298'
      ],
      //backgroundColor:'green',
      backgroundColor: [
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
      text: 'Coopératives par régions (fin décembre 2015)',
      fontSize: 25,
      position:'top',
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
