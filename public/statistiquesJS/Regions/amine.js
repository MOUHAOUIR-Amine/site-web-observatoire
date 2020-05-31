const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://admin-odco:Admin-ODCO@cluster0-gnlog.mongodb.net/ODCODB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  });
  const regionSchema = new mongoose.Schema({
    region: {
      type: String,
      required: true
    },
    nombre: {
      type: Number,
      required: true
    }
  });
  const Region = mongoose.model("Region", regionSchema);

  const meknesTafilalet=new Region({
    region:'Meknes-TAFILALET',
    nombre:1852
  })
  meknesTafilalet.save();
  var reg=[];
  var numb=[];

  Region.find(function(err,regions){
    if (err) {
      console.log(err);
    }else {
      regions.forEach((region, i) => {
        var nameregion=region.region;
        var numregion=region.nombre;
        reg.push(nameregion);
        numb.push(numregion);
      });



    }
  })
