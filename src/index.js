const moment = require('moment-timezone');
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
const Professional = require('./models/Professional')


//Methods
server.addService(professionalProto.ProfessionalService.service, {
    list: async (call, callback) => {

        try {
            let { 
                professionalName = null, 
                professionalEmail = null, 
                professionalAge = null,
            } = call.request;
    
    
            let where = new Object;

            if(professionalName !== null){
                where.professionalName = professionalName;
            }

            if(professionalEmail !== null){
                where.professionalEmail = professionalEmail;
            }

            if(professionalAge !== null){
                where.professionalAge = professionalAge;
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
                professionalAge = null,
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
    
            if(!professionalAge || professionalEmail < 1){
                return callback({
                    code: 400,
                    message: 'Professional Age is invalid.',
                    status: grpc.status.INTERNAL
                  })
            }
    
            const professionalCreate = await Professional.create({ 
                professionalName:  professionalName,
                professionalEmail:  professionalEmail,
                professionalAge:  professionalAge,
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
                professionalEmail = null, 
                professionalAge = null,
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
                    message: 'Professional Id is mandatory.',
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
    
            if(!professionalAge || professionalEmail < 1){
                return callback({
                    code: 400,
                    message: 'Professional Age is invalid.',
                    status: grpc.status.INTERNAL
                })
            }
    
            const professionalUpdate = await Professional.findByIdAndUpdate( _id, {
                professionalName, 
                professionalEmail, 
                professionalAge, 
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