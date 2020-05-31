let myChart = document.getElementById('myChart').getContext('2d');

// Global Options
Chart.defaults.global.defaultFontFamily = 'Lato';
Chart.defaults.global.defaultFontSize = 18;
Chart.defaults.global.defaultFontColor = '#777';

let massPopChart = new Chart(myChart, {
  type: 'pie', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
  data: {
    labels: ['Agriculture', 'Artisanat', 'Argane', 'Forets', 'Denrees Alimentaires', 'Plantes Medicales et aromatiques', 'Peche',
    'Alphabetisation', 'Commercants detaillants', 'Consommation', "Main d'oeuvre", 'Imprimerie-Papeterie', 'Art et culture' ],


    datasets: [{
      label: 'Population',
      data: [
        987,
        763,
        274,
        170,
        35,
        13,
        10,
        8,
        8,
        7,
        3,
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
        'rgba(255, 99, 132, 0.6)'
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
      text: 'Les coopératives par secteur (fin décembre 2015)',
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
