  let myChart = document.getElementById('myChart').getContext('2d');

  // Global Options
  Chart.defaults.global.defaultFontFamily = 'Lato';
  Chart.defaults.global.defaultFontSize = 18;
  Chart.defaults.global.defaultFontColor = '#777';


  let massPopChart = new Chart(myChart, {
    type:'pie', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
    data:{
      labels:['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford'],
      datasets:[{
        label:'Population',
        data:[
          617594,
          181045,
          153060,
          106519,
          105162,
          95072
        ],
        //backgroundColor:'green',
        backgroundColor:[
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderWidth:1,
        borderColor:'#777',
        hoverBorderWidth:3,
        hoverBorderColor:'#000'
      }]
    },
    options:{
      title:{
        display:true,
        text:'Largest Cities In Massachusetts',
        fontSize:25
      },
      legend:{
        display:true,
        position:'right',
        labels:{
          fontColor:'#000'
        }
      },
      layout:{
        padding:{
          left:50,
          right:0,
          bottom:0,
          top:0
        }
      },
      tooltips:{
        enabled:true
      },

    }
  });

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
