const db = require('../../plugins/mysql');
const { isEmpty, currentTime ,resData } = require('../../util/lib');
const STATUS = require('../../util/STATUS');
const TABLE = require('../../util/TABLE');



const getTotal = async () => {
    try {
      const query = `SELECT COUNT(*) AS cnt FROM ${TABLE.PRODUCT}`;
      const [[{ cnt }]] = await db.execute(query);
      return cnt;
    } catch (e) {
      console.log(e.message);
      return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
    }
};

const getList = async (req) => {
    try {

      const lastId = parseInt(req.query.lastId) || 0;
      const len = parseInt(req.query.len) || 10;
  
      let where = "";
      if (lastId) {
        // 0 == false
        
        where = `WHERE id < ${lastId}`;
      }
      const query = `SELECT * FROM ${TABLE.PRODUCT} ${where} order by id desc limit 0, ${len}`;
      const [rows] = await db.execute(query);
      return rows;
    } catch (e) {
      console.log(e.message);
      return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
    }
};
const getOutOfStock = async (req) => {
    try {

      const product_quantity = parseInt(req.query.product_quantity) || 10;
  
      let where = "";
      if (product_quantity) {
        where = `WHERE product_quantity <= ${product_quantity}`;
      }
      const query = `SELECT * FROM ${TABLE.PRODUCT} ${where} order by id desc`;
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
        const query = `SELECT COUNT(*) AS cnt FROM ${TABLE.PRODUCT} WHERE id=?`;
        const values = [id];
        const [[{cnt}]] = await db.execute(query, values);
        return cnt;

    } catch (e) {
        console.log(e.message);
        return resData(STATUS.E300.result, STATUS.E300.resultDesc, currentTime());
    }
};

const productController = {

    //Create
    create: async (req) =>{
        const {product_id, product_name, product_mnf} = req.body;
            //body check
            if(isEmpty(product_id) || isEmpty(product_name) || isEmpty(product_mnf)){
                return resData(STATUS.E100.result, STATUS.E100.resultDesc, currentTime());
            }
            
            try {
                const query = `INSERT INTO product (product_id, product_name, product_mnf) VALUES (?,?,?)`;
                const values = [product_id, product_name, product_mnf];
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

    // 수량변경
    update: async (req) => {
        const { product_id } = req.params; // url / 로 값을 받아오는것
        const { product_quantity } = req.body;
        if (isEmpty(product_id) || isEmpty(product_quantity)){
            return resData(STATUS.E100.result, STATUS.E100.resultDesc, currentTime());
        }

        try {
            const query = `UPDATE ${TABLE.PRODUCT} SET product_quantity = ? WHERE product_id = ?`;
            const values = [product_quantity, product_id];
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
        const { product_id } = req.params;
        if(isEmpty(product_id)){
            return resData(STATUS.E100.result, STATUS.E100.resultDesc, currentTime());
        }

        const cnt = await getSelectOne(product_id);

        try {
            if(!cnt){
                return resData(
                    STATUS.E100.result,
                    STATUS.E100.resultDesc,
                    currentTime()
                );
            }

            const query = `DELETE FROM ${TABLE.PRODUCT} WHERE product_id = ?`;
            const values = [product_id];
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

    //재고부족 찾기
    outofstock: async (req) => {
        const list = await getOutOfStock(req);
        if(list.length) {
            
            return resData(
                STATUS.S200.result,
                STATUS.S200.resultDesc,
                currentTime(),
                {list}
            );
        }
        else{        
            return resData(STATUS.S201.result, STATUS.S201.resultDesc, currentTime());
        }
    },

    
}
module.exports = productController;