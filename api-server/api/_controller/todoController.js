const db = require('../../plugins/mysql');
const { isEmpty, currentTime ,resData } = require('../../util/lib');
const STATUS = require('../../util/STATUS');
const TABLE = require('../../util/TABLE');
//const { post } = require('../todo');
const moment = require("../../util/moment");

//total row
const getTotal = async () => {
    try {
      const query = `SELECT COUNT(*) AS cnt FROM ${TABLE.TODO}`;
      const [[{ cnt }]] = await db.execute(query);
      return cnt;
    } catch (e) {
      console.log(e.message);
      return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
    }
};

//Paging으로 가져오기
const getList = async (req) => {
    try {
      // last id, len 
      const lastId = parseInt(req.query.lastId) || 0;
      const len = parseInt(req.query.len) || 10;
  
      let where = "";
      if (lastId) {
        // 0 == false
        
        where = `WHERE id < ${lastId}`;
      }
      const query = `SELECT * FROM ${TABLE.TODO} ${where} order by id desc limit 0, ${len}`;
      const [rows] = await db.execute(query);
      return rows;
    } catch (e) {
      console.log(e.message);
      return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
    }
};

// row 존재유무
const getSelectOne = async () =>{
    try {
        const query = `SELECT COUNT(*) AS cnt FROM ${TABLE.TODO} WHERE id=?`;
        const values = [id];
        const [[{cnt}]] = await db.execute(query, values);
        return cnt;

    } catch (e) {
        console.log(e.message);
        return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
    }
};

const todoController = {

    //Create
    create: async (req) =>{
        const {title, done} = req.body;
            //body check
            if(isEmpty(title) || isEmpty(done)){
                return resData(STATUS.E100.result, STATUS.E100.resultDesc, currentTime());
            }
            
            try {
                const query = `INSERT INTO todo (title, done) VALUES (?,?)`;
                const values = [title, done];
                const [rows] = await db.execute(query, values);
                
                if(rows.affectedRows == 1) {
                    return resData(
                        STATUS.S200.result,
                        STATUS.S200.resultDesc,
                        currentTime()
                    );
                }
            } catch (e) {
                console.log(e.message);
                return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
            }
    },

    //List
    list: async (req) => {
        const totalCount = await getTotal();
        const list = await getList(req);
        if(totalCount > 0 && list.length) {
            
            return resData(
                STATUS.S200.result,
                STATUS.S200.resultDesc,
                currentTime(),
                {totalCount, list}
            );
        }
        else{        
            return resData(STATUS.S201.result, STATUS.S201.resultDesc, currentTime());
        }
    },

    // Update
    update: async (req) => {
        const { id } = req.params; // url / 로 값을 받아오는것
        const { title, done } = req.body;
        if (isEmpty(id) || isEmpty(title) || isEmpty(done)){
            return resData(STATUS.E100.result, STATUS.E100.resultDesc, currentTime());
        }

        try {
            const query = `UPDATE ${TABLE.TODO} SET title = ?, done = ? WHERE id = ?`;
            const values = [title, done, id];
            const [rows] = await db.execute(query, values);

            if(rows.affectedRows == 1){
                return resData(
                    STATUS.S200.result,
                    STATUS.S200.resultDesc,
                    currentTime()
                );
            }
        } catch (e) {
            console.log(e.message);
            return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
        }
    },

    delete: async (req) => {
        const { id } = req.params;
        if(isEmpty(id)){
            return resData(STATUS.E100.result, STATUS.E100.resultDesc, currentTime());
        }

        const cnt = await getSelectOne(id);

        try {
            if(!cnt){
                return resData(
                    STATUS.E100.result,
                    STATUS.E100.resultDesc,
                    currentTime()
                );
            }

            const query = `DELETE FROM ${TABLE.TODO} WHERE id = ?`;
            const values = [id];
            const [rows] = await db.execute(query, values);

            if(rows.affectedRows == 1){
                return resData(
                    STATUS.S200.result,
                    STATUS.S200.resultDesc,
                    currentTime()
                );
            }


        } catch (e) {
            console.log(e.message);
            return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
        }
        return rows;
    },
    
    reset: async (req) => {
        //1. 테이블 내용 지우기
        //2. title에 내용 번호 부여, 1씩증가, len만큼 insert
        //3. 성공으로 리턴

        //테이블 내용 지우기
        try {
            const query = `TRUNCATE ${TABLE.TODO}`;
            await db.execute(query);
                
        } catch (e) {
            console.log(e.message);
            return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
        }

        //title에 내용 번호 부여, 1씩 증가, len만큼 증가
        const title = req.body;
        const done = req.body.done || "N";
        const len = parseInt(req.query.len) || 100;

        if(isEmpty(title)){
            return resData(STATUS.E100.result, STATUS.E100.resultDesc, currentTime());
        }
        
        try {
            let query = `INSERT INTO todo (title, done) VALUES`;
            let array = [];
            for(let i = 0 ; i < len ; i++ ){
                array.push(`('${title}_${i}','${done}')`);
            }

            query = query + array.join(",");
            const [rows] = await db.execute(query);
            
            if(rows.affectedRows != 0){
                return resData(
                    STATUS.S200.result,
                    STATUS.S200.resultDesc,
                    currentTime()
                );
            }

        } catch (e) {
            console.log(e.message);
            return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
        }
    },


    /*
    async getTest(){
        const query =  `SELECT * FROM vue.todo`;
        const [[rows]] = await db.execute(query);
        console.log(rows);
        return rows;
    },
    */
    
    
}
module.exports = todoController;