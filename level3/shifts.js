const fs = require("fs");
let payroll;

/*
  week end shifts are worth twice a week's salary
  1. find out if the start date is either saturday or sunday
  2. add price * 2 if so, normal price if not 
 */
// 1. read the file

let data = fs.readFileSync("./data.json", "utf8");

// 2. convert json to objet
dataObj = JSON.parse(data);
let workersWithPrice = initWorkers(dataObj);
payroll = calcShifts(dataObj.shifts, workersWithPrice);
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

// 3. créer la fonction pple
function initWorkers(obj) {
  // clone workerz
  let workerz = [...obj.workers];
  // init price for each worker
  workerz.forEach(worker => {
    worker.price = 0;
    worker.price_per_shift = worker.status === "medic" ? 270 : 126;
  });
  return workerz;
}

// Does not return anything, only modifies workersWithPrice object
function calcShifts(shiftObj, workersObj) {
  shiftObj.forEach(shift => {
    let currentWorker = workersObj.find(worker => worker.id === shift.user_id);
    const shiftDate = new Date(shift.start_date)
    // if worker exists and shift IS NOT on a saturday or sunday 
    if (currentWorker && shiftDate.getDay() !== 6 && shiftDate.getDay() !== 0) {
      currentWorker.price += currentWorker.price_per_shift;
      console.log(`NOT THE WEEK END! shift id: ${shift.id} ${shiftDate} ${shiftDate.getDay()}`)
      // if worker exists and shift IS on a saturday or sunday 
    } else if (currentWorker) {
      currentWorker.price += currentWorker.price_per_shift * 2;
      console.log(`WEEK END! shift id: ${shift.id} ${shiftDate} ${shiftDate.getDay()}`)
    }
    // console.log(currentWorker);
  });
  return workersObj;
}
