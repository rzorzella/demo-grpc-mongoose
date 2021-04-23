const moment = require('moment-timezone');
const bcrypt = require('bcrypt');
const saltRounds = 10;
moment.locale('pt-br');

//gRPC
const PROTO_PATH = "./professional.proto";
let grpc = require("grpc");
let protoLoader = require("@grpc/proto-loader");
let packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});
let professionalProto = grpc.loadPackageDefinition(packageDefinition);
const server = new grpc.Server();


//Models
const Professional = require('./models/Professional');
const { verify } = require('../../../grpc/teste-express/src/modules/mailer');


//Methods
server.addService(professionalProto.ProfessionalService.service, {
    list: async (call, callback) => {

        try {
            let { 
                professionalName = null, 
                professionalEmail = null, 
            } = call.request;
    
    
            let where = new Object;

            if(professionalName !== null){
                where.professionalName = professionalName;
            }

            if(professionalEmail !== null){
                where.professionalEmail = professionalEmail;
            }

            const professionals = await Professional.find(where);

            return callback(null, {professionals});

        } catch (err) {
            return callback({
                code: 400,
                message: `Cannot List Professional: [${err}]`,
                status: grpc.status.INTERNAL
              })
        }
    },
    get: async (call, callback) => {

        try {
            let { 
                _id = null, 
            } = call.request;
    
            if(!_id || _id == ''){
                return callback({
                    code: 400,
                    message: 'Professional Name is mandatory.',
                    status: grpc.status.INTERNAL
                })
            }

            const professional = await Professional.findById(_id);

            if(!professional){
                return callback({
                    code: 400,
                    message: 'Professional Id not found.',
                    status: grpc.status.INTERNAL
                })
            }

            return callback(null, {professional});

        } catch (err) {
            return callback({
                code: 400,
                message: `Cannot List Professional: [${err}]`,
                status: grpc.status.INTERNAL
              })
        }
    },
    create: async (call, callback) => {
       
        try {

            let { 
                _id = null,
                professionalName = null, 
                professionalEmail = null, 
                professionalPassword = null,
            } = call.request;

        
            if(!professionalName || professionalName == ''){
                return callback({
                    code: 400,
                    message: 'Professional Name is mandatory.',
                    status: grpc.status.INTERNAL
                  })
            }
    
            if(!professionalEmail || professionalEmail == ''){
                return callback({
                    code: 400,
                    message: 'Professional Email is mandatory.',
                    status: grpc.status.INTERNAL
                  })
            }
    
            if(!professionalPassword || professionalPassword == ''){
                return callback({
                    code: 400,
                    message: 'Professional Password is invalid.',
                    status: grpc.status.INTERNAL
                  })
            }
    
            const professionalFindEmail = await Professional.find({professionalEmail});

            if(professionalFindEmail.length>0){
                return callback({
                    code: 400,
                    message: 'Professional Email already exits.',
                    status: grpc.status.INTERNAL
                })
            }

            const professionalenCryptedPassword = bcrypt.hashSync(professionalPassword, saltRounds);
            const passwordTest = bcrypt.compareSync(professionalPassword, professionalenCryptedPassword); // false
            console.log(professionalenCryptedPassword, passwordTest)

            const professionalCreate = await Professional.create({ 
                professionalName:  professionalName,
                professionalEmail:  professionalEmail,
                professionalPassword:  professionalenCryptedPassword,
            });
    
            return callback(null, professionalCreate);

        } catch (err) {
            return callback({
                code: 400,
                message: `Cannot Create Professional: [${err}]`,
                status: grpc.status.INTERNAL
              })
        }
    },
    update: async (call, callback) => {
        try {

            let { 
                _id = null,
                professionalName = null, 
                professionalPassword = null,
            } = call.request;

            if(!_id || _id == ''){
                return callback({
                    code: 400,
                    message: 'Professional Name is mandatory.',
                    status: grpc.status.INTERNAL
                })
            }

            const professionalFind = await Professional.findById(_id);

            if(!professionalFind){
                return callback({
                    code: 400,
                    message: 'Professional Id not found.',
                    status: grpc.status.INTERNAL
                })
            }

            if(!professionalName || professionalName == ''){
                return callback({
                    code: 400,
                    message: 'Professional Name is mandatory!',
                    status: grpc.status.INTERNAL
                })
            }

            if(!professionalPassword || professionalPassword == ''){
                return callback({
                    code: 400,
                    message: 'Password is mandatory.',
                    status: grpc.status.INTERNAL
                })
            }
    
            const professionalenCryptedPassword = bcrypt.hashSync(professionalPassword, saltRounds);
            const passwordTest = bcrypt.compareSync(professionalPassword, professionalenCryptedPassword); // false
            console.log(professionalenCryptedPassword, passwordTest)

            const professionalUpdate = await Professional.findByIdAndUpdate( _id, {
                professionalName, 
                professionalPassword: professionalenCryptedPassword, 
                },
                {new: true}
            );
    
            return callback(null, professionalUpdate);

        } catch (err) {
            return callback({
                code: 400,
                message: `Cannot Update Professional: [${err}]`,
                status: grpc.status.INTERNAL
              })
        }
    },
    verifyPass: async (call, callback) => {
        try {

            let { 
                professionalEmail = null, 
                professionalPassword = null,
            } = call.request;


            if(!professionalEmail || professionalEmail == ''){
                return callback({
                    code: 400,
                    message: 'Profesional Eamil is mandatory.',
                    status: grpc.status.INTERNAL
                })
            }
    
            if(!professionalPassword || professionalPassword == ''){
                return callback({
                    code: 400,
                    message: 'Password is mandatory.',
                    status: grpc.status.INTERNAL
                })
            }


            const professionalFindEmail = await Professional.findOne({professionalEmail});

            if(!professionalFindEmail){
                return callback({
                    code: 400,
                    message: 'Professional Email not found.',
                    status: grpc.status.INTERNAL
                })
            }

            const verifyPass = await {verifyPass: bcrypt.compareSync(professionalPassword, professionalFindEmail.professionalPassword)}; 

            return callback(null, verifyPass);

        } catch (err) {
            return callback({
                code: 400,
                message: `Cannot verify Professional Password: [${err}]`,
                status: grpc.status.INTERNAL
              })
        }
    },
    delete: async (call, callback) => {

        try {
            let { 
                _id = null, 
            } = call.request;
    
            if(!_id || _id == ''){
                return callback({
                    code: 400,
                    message: 'Professional Id is mandatory.',
                    status: grpc.status.INTERNAL
                })
            }

            const professional = await Professional.findById(_id);

            if(!professional){
                return callback({
                    code: 400,
                    message: 'Professional Id not found.',
                    status: grpc.status.INTERNAL
                })
            }

            const professionalDelete = await Professional.findByIdAndRemove(_id);

            return callback(null, {professionalDelete});

        } catch (err) {
            return callback({
                code: 400,
                message: `Cannot List Professional: [${err}]`,
                status: grpc.status.INTERNAL
              })
        }
    },
});

server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure());
console.log("Server running at http://127.0.0.1:50051");
server.start();


//==