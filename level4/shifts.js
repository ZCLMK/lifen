const fs = require("fs");

// 1. read the file

let data = fs.readFileSync("./data.json", "utf8");

// 2. convert json to objet
dataObj = JSON.parse(data);
let workersWithPrice = initWorkers(dataObj); // each worker is assigned a fee
let totalExpenditure = initCommission(workersWithPrice); // an object in which commissions are merged with workers 
let payroll = calcShifts(dataObj.shifts, totalExpenditure.workers);
console.log(totalExpenditure)

// delete unwanted first_name and price_per_shift keys from payroll object
payroll.forEach(worker => {
  delete worker.first_name;
  delete worker.price_per_shift;
  delete worker.status;
});
// write payroll to output.json
fs.writeFileSync("./output.json", JSON.stringify(payroll));
console.log("./output.json was created!");

// write payroll to output.json file

function initWorkers(obj) {
  // clone workers
  let workerz = [...obj.workers];
  // init price for each worker
  workerz.forEach(worker => {
    worker.price = 0;
    if(worker.status === 'medic'){
        worker.price_per_shift = 270
    }else if (worker.status === 'interne'){
        worker.price_per_shift = 126
    }else if(worker.status === 'interim'){
        worker.price_per_shift = 480
    }
  });

  return workerz;
}

function initCommission(workers){
    return {
        workers : [...workers],
        commission: {
            "pdg_fee" : 0,
            "interim_shifts" : 0
        }
    }
}

// add 80€ per interim shift, and add interim shift to count of interim shifts 
function getFixedCommission(worker){
 if(worker.status === 'interim'){
     totalExpenditure['commission']['interim_shifts'] += 1;
     totalExpenditure['commission']['pdg_fee'] += 80;
 }
}

function getFivePercent(fee){
    totalExpenditure['commission']['pdg_fee'] += fee * 0.05
}
// Does not return anything, only modifies workersWithPrice object

function calcShifts(shiftObj, workersObj) {
  shiftObj.forEach(shift => {
    let currentWorker = workersObj.find(worker => worker.id === shift.user_id);
    getFixedCommission(currentWorker);
   
    const shiftDate = new Date(shift.start_date)

    // if worker exists and shift IS NOT on a saturday or sunday 
    if (currentWorker && shiftDate.getDay() !== 6 && shiftDate.getDay() !== 0) {
      currentWorker.price += currentWorker.price_per_shift;
      getFivePercent(currentWorker.price_per_shift);
    } else if (currentWorker) { //if shift is on saturday or sunday
      currentWorker.price += currentWorker.price_per_shift * 2;
      getFivePercent(currentWorker.price_per_shift * 2);
    }
    // console.log(currentWorker);
  });
  return workersObj;
}
