const express = require('express');
const moment = require('moment-timezone');


process.env.TZ = 'America/Sao_Paulo';
process.env.TIMEZONE = 'America/Sao_Paulo';
var x = new Date();
var offset= -x.getTimezoneOffset();

console.log(offset);
console.log("aaaaaaa");

moment.locale('pt-br');

//Models
const AvailableSchedule = require('../models/AvailableSchedule')
const Holiday = require('../models/Holidays')

const router = express.Router();

//List
router.get('/', async (req, res) =>{
    // const hollidaysCount = await Holiday.countDocuments();
    // if (hollidaysCount === 0) {
    //     await Holiday.insertMany([
    //       { holiday_date: "2021-01-01", description: "Ano Novo", type: 0},
    //       { holiday_date: "2021-04-01", description: "Feriado Fake 1", type: 0},
    //       { holiday_date: "2021-04-30", description: "Feriado Fake 2", type: 0},
    //       { holiday_date: "2021-06-03", description: "Meu Aniversário", type: 0},
    //       { holiday_date: "2021-06-04", description: "Seu Aniversário", type: 0},
    //       { holiday_date: "2021-07-01", description: "Feriado Fake 3", type: 0},
    //       { holiday_date: "2021-07-20", description: "Feriado Fake 4", type: 0},
    //       { holiday_date: "2021-08-04", description: "Feriado Fake 5", type: 0},
    //       { holiday_date: "2021-08-06", description: "Feriado Fake 6", type: 0},
    //       { holiday_date: "2021-09-01", description: "Feriado Fake 7", type: 0},
    //       { holiday_date: "2021-09-10", description: "Feriado Fake 8", type: 0},
    //     ]);
    // }

    let { 
        startDate = "2021-01-01", 
        endDate = "2099-12-31", 
        professionalHasPlace_Place_id = null,
        professionalHasPlace_Professional_id = null
    } = req.query;

    try {

        let start = null;
        let end = null;
        let where = new Object();
        let whereDates = new Object();
        //where.deletedAt=null;  // do not read deleted records

        if(professionalHasPlace_Professional_id !== null){
            where.professionalHasPlace_Professional_id = professionalHasPlace_Professional_id;
        }
    
        if(professionalHasPlace_Place_id !== null){
            where.professionalHasPlace_Place_id = professionalHasPlace_Place_id;
        }

        if(!startDate)
            return res.status(400).send({error: `Please, iform Start Date`});

        if(!endDate)
            return res.status(400).send({error: `Please, iform End Date`});

        if(endDate < startDate)
            return res.status(400).send({error: `End Date could't be before Start Date`});

        if(startDate !== null && startDate.trim() !== ''){
            start = moment(startDate, 'YYYY-MM-DD');
            if(!start.isValid())
                return res.status(400).send({error: 'The parameter startDate is invalid.'});
        }

        if(endDate !== null && endDate.trim() !== ''){

            end = moment(endDate, 'YYYY-MM-DD');
            if(!end.isValid())
                return res.status(400).send({error: 'The parameter endDate is invalid.'});
                
            if(startDate == null)
                return res.status(400).send({error: 'Please, informe startDate.'});
            //where.initial_date = { '>=': startDate, '<=': endDate };
            where.initial_date = { $lte: endDate };
            where.final_date   = { $gte: startDate };

        }
        
        let whereHoliday = {};
        whereHoliday.holiday_date = { $gte: startDate , $lte: endDate };

        const availableScheduleFind = await AvailableSchedule.find(where);
        
        console.log("-=-=-=-=-=>>>>>>>>>",where);
        // console.log("<<<<<<<<<<<-=-=-=-=-=>>>>>>>>>");

        let hasHoliday = await Holiday.find(whereHoliday);

        let arrayHasHoliday = [];
        hasHoliday.forEach( function(element) {
            arrayHasHoliday.push(element.holiday_date.toJSON().slice(0,10));
        });
        console.log("JJJJJJJJJJ============>",arrayHasHoliday);

        let availableSchedule = [];
        availableScheduleFind.forEach( function(elementAvailableScheduleFind) {
            let newObject = elementAvailableScheduleFind;
            console.log("0.0============>",newObject)
            if(moment(newObject.initial_date, 'YYYY-MM-DD').format("YYYY-MM-DD") < start.format("YYYY-MM-DD")){
                newObject.initial_date = start.format("YYYY-MM-DD");
                console.log(start.format("YYYY-MM-DD"), "1 ============>",newObject.initial_date)

            }

            if(moment(newObject.final_date, 'YYYY-MM-DD').format("YYYY-MM-DD") > end.format("YYYY-MM-DD")){
                newObject.final_date = end.format("YYYY-MM-DD");
                console.log(end.format("YYYY-MM-DD"), "2 ============>",newObject.final_date)
            }

            if(hasHoliday.length==0){
                availableSchedule.push(newObject.newObject);
                console.log("3 ============>",newObject.final_date)
            } else {
                console.log("0.1============>",newObject)
                let initialDate = moment(newObject.initial_date, 'YYYY-MM-DD').format("YYYY-MM-DD");
                let finalDate = moment(newObject.final_date, 'YYYY-MM-DD').format("YYYY-MM-DD");
                console.log("4.0 ============>", initialDate, finalDate)
                let dayBefore = initialDate;
                let firstDay = initialDate;
                for (let oneDay = initialDate; oneDay <= finalDate; oneDay = moment(oneDay, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD")) {
                    // console.log(`--OneDay------->${oneDay} / *${arrayHasHoliday[0]}* / ${oneDay===arrayHasHoliday[0]}`);
                    let indexHoliday = arrayHasHoliday.indexOf(oneDay);
                    console.log("4.1 ============>",oneDay)
                    if(indexHoliday !== -1 ){
                        if(oneDay==firstDay){
                            firstDay = moment(oneDay, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD");
                            continue;
                        }
                        newObject.initial_date=firstDay;
                        newObject.final_date=dayBefore;
                        availableSchedule.push(newObject);
                        firstDay = moment(oneDay, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD");
                        availableSchedule.push(newObject);
                        console.log("4.2 ============>",newObject)
                        continue
                    }
                    dayBefore = oneDay;
                }
                if(dayBefore>=firstDay){
                    newObject.initial_date=firstDay;
                    newObject.final_date=dayBefore;
                    availableSchedule.push(newObject);
                    console.log(" ============>",newObject)
                }
            };
        });

        const totalCount = Object.keys(availableSchedule).length;
        res.set("X-Total-Count",totalCount);

        return res.send({ availableSchedule })

    } catch (err) {
        res.status(400).send({error: `Cannot list Available Schedule -> ${err} `});
    }
});

//Show
router.get('/:id', async (req, res) =>{
    try {
        const availableSchedule = await AvailableSchedule.findById(req.params.id);
        if(!availableSchedule)
            return res.status(400).send({error: `Cannot find Available Schedule Id [ ${id} ]`});

        return res.send({ availableSchedule })

    } catch (err) {
        res.status(400).send({error: 'Cannot load Available Schedule'});
    }
});

//Create
router.post('/', async (req, res) =>{
    try {
        const { 
            initial_date, 
            final_date, 
            initial_hour, 
            final_hour, 
            week_days, 
            professionalHasPlace_Place_id,
            professionalHasPlace_Professional_id, 
        } = req.body;

        ////////////
        //Validation   hh:mm:ss
        ////////////
        if(final_date < initial_date)
            return res.status(400).send({error: `Final Date could't be before Initial Date`});

        if(initial_date !== null && initial_date.trim() !== ''){
            startDate = moment(initial_date, 'YYYY-MM-DD');
            if(!startDate.isValid())
                return res.status(400).send({error: 'The parameter initial_date is invalid.'});
        }

        if(final_date !== null && final_date.trim() !== ''){

            endDate = moment(final_date, 'YYYY-MM-DD');
            if(!endDate.isValid())
                return res.status(400).send({error: 'The parameter final_date is invalid.'});
                
            if(initial_date == null)
                return res.status(400).send({error: 'Please, informe initial_date.'});

        }

        if(initial_hour !== null && initial_hour.trim() !== ''){
            startHour = moment(initial_hour, 'hh:mm');
            if(!startHour.isValid())
                return res.status(400).send({error: 'The parameter initial_hour is invalid.'});
        }

        if(final_hour !== null && final_hour.trim() !== ''){
            endHour = moment(final_hour, 'hh:mm');
            if(!endHour.isValid())
                return res.status(400).send({error: 'The parameter final_hour is invalid.'});
        }

        if(!week_days || !testWeekDay(week_days))
            return res.status(400).send({error: 'The parameter Week Days is invalid.'});

        ///////////////
        ///////////////

        const availableSchedule = await AvailableSchedule.create({ initial_date, final_date, initial_hour, final_hour, week_days, professionalHasPlace_Place_id, professionalHasPlace_Professional_id });

        return res.send({ availableSchedule });

    } catch (err) {
        res.status(400).send({error: `Cannot create new Schedule -> [ ${err} ]`});
    }
    
});

//Update
router.put('/:id', async (req, res) =>{
    try {

        const { 
            id = null
        } = req.params;

        const { 
            initial_date = null, 
            final_date = null, 
            initial_hour = null, 
            final_hour = null, 
            week_days = null, 
        } = req.body;

        ////////////
        //Validation
        ////////////
        const availableScheduleId = await AvailableSchedule.findById(id);
        if (!availableScheduleId)
            return res.status(400).send({error: `Available Schedule Id [${id}] doesn't exist`});

        if(final_date < initial_date)
            return res.status(400).send({error: `Final Date could't be before Initial Date`});

        if(initial_date !== null && initial_date.trim() !== ''){
            startDate = moment(initial_date, 'YYYY-MM-DD');
            if(!startDate.isValid())
                return res.status(400).send({error: 'The parameter initial_date is invalid.'});
        }

        if(final_date !== null && final_date.trim() !== ''){

            endDate = moment(final_date, 'YYYY-MM-DD');
            if(!endDate.isValid())
                return res.status(400).send({error: 'The parameter final_date is invalid.'});
                
            if(initial_date == null)
                return res.status(400).send({error: 'Please, informe initial_date.'});

        }

        if(initial_hour !== null && initial_hour.trim() !== ''){
            startHour = moment(initial_hour, 'hh:mm');
            if(!startHour.isValid())
                return res.status(400).send({error: 'The parameter initial_hour is invalid.'});
        }

        if(final_hour !== null && final_hour.trim() !== ''){
            endHour = moment(final_hour, 'hh:mm');
            if(!endHour.isValid())
                return res.status(400).send({error: 'The parameter final_hour is invalid.'});
        }

        if(!week_days || !testWeekDay(week_days))
            return res.status(400).send({error: 'The parameter Week Days is invalid.'});

        const updateAvailableSchedule = await AvailableSchedule.findByIdAndUpdate( id, {
            initial_date, 
            final_date, 
            initial_hour, 
            final_hour, 
            week_days, 
            },
            {new: true}
        );
        
        if(!updateAvailableSchedule)
            return res.status(400).send({error: 'Cannot update Available Schedule'});

        return res.send({ updateAvailableSchedule })
    



    } catch (err) {
        res.status(400).send({error: `Cannot update project -> [ ${err} ]`});
    }
});

//Delete
router.delete('/:id', async (req, res) =>{
    try {
        const availableSchedule = await AvailableSchedule.findById(req.params.id);
        if(!availableSchedule)
            return res.status(400).send({error: `Cannot find Available Schedule Id [${req.params.id}]`});


        const availableScheduleDelete = await AvailableSchedule.findByIdAndRemove(req.params.id);

        return res.send(availableScheduleDelete)

    } catch (err) {
        res.status(400).send({error: `Error Deleting Available Schedule: [ ${err} ]`});
    }

});


function testWeekDay(testWeekDay){
    const re = /^((Mon)|(Tue)|(Wed)|(Thu)|(Fri)|(Sat)|(Sun))$/;
    itsOk = true;
    testWeekDay.forEach(element => {
        if(!re.test(element)){
            console.log(element);
            itsOk = false;
        }
    });
    return itsOk;
}


module.exports = app => app.use('/availableschedule', router);
