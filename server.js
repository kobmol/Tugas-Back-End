var mysql = require("mysql");
var express = require('express');
var app = express();

var session = require('express-session');
app.use(session({secret: 'ssshhhhh'}));
var sess;

const crypto = require('crypto');
const secret = 'abcdefg';

app.set('view engine', 'ejs');

var bodyParser = require('body-parser')
var url = bodyParser.urlencoded({ extended: false })

var connection = mysql.createConnection
(
    {
        host: "localhost",
        port: 3307,
        database: "shop",
        user: "root",
        password: "usbw",
    }
);
// ======ADMIN ==============
app.get('/dashadmin',function(req,res){
    connection.query('select * from kategori',function(err,rows,field){
        connection.query('select subktg.id,season,jenis_kategori from kategori ktg join sub_kategori subktg ON ktg.id = subktg.id_season order by subktg.id', function(err,rows1,field){
            connection.query('select prd.id,season,jenis_kategori,nama_produk, deskripsi,harga from kategori ktg join sub_kategori subktg ON ktg.id=subktg.id_season join produk prd on subktg.id = prd.id_subkategori order by prd.id', function(err,rows2,field){
                connection.query('SELECT produk_warna.id,nama_produk,warna FROM produk_warna left join produk on produk_warna.id_produk = produk.id order by produk_warna.id',function(err,rows4,field){
                    connection.query('select * from produk', function(err, rows5){ 
                        connection.query('select up.id,warna,ukuran,stock from produk_warna pw join ukuran_produk up on pw.id = up.idproduk_warna  ',function(err,rows6){
                        res.render(__dirname+'/views/dsadmin',{rendi:rows,rendi2:rows1,rendi3:rows2,rendi4:rows4,rendi5:rows5,rendi6:rows6})
                    })
                })                        
            })
        })
    })
})
})
    app.post('/simpankategori',url,function(req,res){
        connection.query('insert into kategori set ?',{
            season:req.body.kategori
        })
        res.redirect('/dashadmin')
    })

// =========FORMEDIT SEASON=================================================
app.get('/formedit_kategori/:id', function(req,res){
    res.render('formedit_kategori',{
        id:req.params.id
    })
});

app.post('/editdata_kategori/:id',url,function(req,res){ 
    connection.query('update kategori set ? where ?',[
        {season: req.body.kategori},
        {id: req.params.id}
    ])
    res.redirect('/dashadmin');
})

app.get('/formedit_subkategori/:id', function(req,res){
    res.render('formedit_subkategori',{
        id:req.params.id
    })
});

app.post('/editdata_subkategori/:id',url,function(req,res){ 
    connection.query('update sub_kategori set ? where ?',[
        {jenis_kategori: req.body.sub_kategori},
        {id: req.params.id}
    ])
    res.redirect('/dashadmin');
})

// ==========DELETE SEASON=============
app.get('/delete_kat/:id', function(req,res) {
    connection.query('delete from kategori where ?',{
        id : req.params.id,
    })
    res.redirect('/dashadmin');
});

app.get('/delete_subkat/:id', function(req,res) {
    connection.query('delete from sub_kategori where ?',{
        id : req.params.id,
    })
    res.redirect('/dashadmin');
});

// ============= SUB KATEGORI==================
app.post('/simpansubkategori',url,function(req,res){
    connection.query('insert into sub_kategori set ?',{
        jenis_kategori:req.body.subkategori,
        id_season:req.body.id_season_subkategori
    })
    res.redirect('/dashadmin')
})


// =======================PRODUK ADMIN====================================================

app.post('/simpanproduk',url,function(req,res){
    connection.query('insert into produk set ?',{
        nama_produk:req.body.namaproduk,
        deskripsi:req.body.deskripsiproduk,
        harga:req.body.hargaproduk,
        id_subkategori:req.body.id_subkategoriproduk
    })
    res.redirect('/dashadmin')
})

// =============DELETE PRODUK================
app.get('/delete_produk/:id', function(req,res) {
    connection.query('delete from produk where ?',{
        id : req.params.id
    })
    res.redirect('/dashadmin');
});
// ===============EDIT PRODUK=================
app.get('/formedit_produk/:id', function(req,res){
    res.render('formedit_produk',{
        id:req.params.id
    })
});

app.post('/editdata_produk/:id',url,function(req,res){ 
    connection.query('update produk set ? where ?',[
        {nama_produk : req.body.namaproduk},
        {deskripsi : req.body.deskripsiproduk},
        {harga : req.body.hargaproduk},
        {id: req.params.id}
    ])
    res.redirect('/dashadmin');
})

//=======================INPUT WARNA===================

app.post('/simpanwarna',url,function(req,res){
    connection.query('insert into produk_warna set ?',{
        warna: req.body.warnaproduk,
        id_produk: req.body.id_produk2
    });
    res.redirect('/dashadmin')
})

app.get('/delete_warna/:id', function(req,res) {
    connection.query('delete from produk_warna where ?',{
        id : req.params.id
    })
    res.redirect('/dashadmin');
});


//============================== INPUT SIZE========================

app.post('/simpanukuran',url,function(req,res){
    connection.query('insert into ukuran_produk set ?',{
        ukuran: req.body.ukuranproduk,
        stock: req.body.stokproduk,
        idproduk_warna: req.body.produkwarna
    });
    res.redirect('/dashadmin')
})

app.get('/delete_ukuran/:id', function(req,res) {
    connection.query('delete from ukuran_produk where ?',{
        id : req.params.id
    })
    res.redirect('/dashadmin');
});

// =================================================== USER ================================================================

//=============================KATEGORI=====================

app.get('/homeuser', function(req,res){
    connection.query('select * from kategori', function(err,budi){

        res.render(__dirname+'/user/homeuser',{kategori:budi, dataheader: req.session.username})
        console.log(budi)
    })
})

//============================= SUB KATEGORI=====================

app.get('/subkategori/:id',function(req,res){
    connection.query('select sub_kategori.id,season,jenis_kategori from kategori join sub_kategori on kategori.id=sub_kategori.id_season where sub_kategori.id_season=?',[req.params.id], function(err,rows){
        res.render(__dirname+'/user/homesubkategori',{subkategori:rows, dataheader: req.session.username})
    })
})

//============================= PRODUK=====================
app.get('/produk/:id',function(req,res){
    connection.query('select produk.id, jenis_kategori,nama_produk,deskripsi,harga from sub_kategori join produk on sub_kategori.id = produk.id_subkategori where produk.id_subkategori=?',[req.params.id],function(err,rows){
        res.render(__dirname+'/user/produk',{produk:rows, dataheader: req.session.username})        
    })
})

//============================= WARNA PRODUK=====================
app.get('/warnaproduk/:id',function(req,res){
    connection.query('select produk_warna.id,nama_produk,warna from produk join produk_warna on produk.id=produk_Warna.id_produk where produk_warna.id_produk=?',[req.params.id],function(err,rows){
        res.render(__dirname+'/user/warnaproduk',{produkwarna:rows, dataheader: req.session.username})        
    })
})

//============================= UKURAN DAN STOK PRODUK=====================
app.get('/stokproduk/:id',function(req,res){
    connection.query('select ukuran_produk.id,warna,ukuran,stock from produk_warna join ukuran_produk on produk_warna.id=ukuran_produk.idproduk_warna where ukuran_produk.idproduk_warna=?',[req.params.id],function(err,rows){
        res.render(__dirname+'/user/ukuranprodukstok',{produkstock:rows, dataheader: req.session.username})        
    })
})

//============================= DETAIL PRODUK=====================

app.get('/detailproduk/:id',function(req,res){
    connection.query('select up.id,season,jenis_kategori,harga,nama_produk,warna,stock,ukuran from kategori join sub_kategori on kategori.id = sub_kategori.id_season join produk prd on sub_kategori.id=prd.id_subkategori join produk_warna pw on prd.id=pw.id_produk join ukuran_produk up on pw.id=up.idproduk_warna where up.id =  ?',[req.params.id],function(err,rows){
    res.render(__dirname+'/user/details',{detail:rows, dataheader: req.session.username}) 
    console.log(rows)       
    })
})

app.post('/inputkeranjang',url,function(req,res){
    connection.query('insert into keranjang set ?',{
        Price:req.body.harga,
        Kuantitas:req.body.inputbeli,
        id_ukuranproduk : req.body.id
    })
    res.redirect('/keranjang')
})

// ================================== KERANJANG ======================================
app.get('/keranjang',function(req,res){
    if(req.session.username==null){
        res.redirect('/')
    }
    else{
    connection.query('select krg.id,nama_produk,warna,ukuran,stock,Kuantitas,Price,(Kuantitas*Price) as total_harga from produk pr join produk_warna pw on pr.id = pw.id_produk JOIN ukuran_produk up on pw.id = up.idproduk_warna JOIN keranjang krg on up.id = krg.id_ukuranproduk' ,function (err,rows,field) {
        res.render(__dirname+'/user/keranjang' , {keranjang : rows, dataheader: req.session.username})
        console.log(rows)
        })
    }
})

app.get('/delete_keranjang/:id', function(req,res) {
    connection.query('delete from keranjang where ?',{
        id : req.params.id
    })
    res.redirect('/keranjang');
});




// ================================================= LOGIN USER==========================================================

// =======================================HALAMAN LOGIN
app.get('/', function(req,res){
    res.render(__dirname+'/userlogin/formlogin')
            {
                notif : ''
            }
        })

app.post('/login',url,function(req,res){
    var sql = 'select * from userlogin where username = ? and password = ?';
    connection.query(sql, [req.body.username, req.body.userpassword], function(err, rows){
        if (rows.length > 0){
            sess=req.session;
            sess.userid = rows[0].userid;
            sess.username=rows[0].username;
            res.redirect('/homeuser');
        }
        else{
            res.render(__dirname+'/userlogin/formlogin',{
                notif : 'Maaf, Username atau Password Salah ! '                                
                });
            }
        });
    })
//====================================================== HALAMAN LOGOUT
app.get('/logout',function(req,res)
{
    req.session.destroy(function(err) 
    {
        if(err) 
        {
            console.log(err);
        } 
        else {
            res.redirect('/');
        }
    });
});   

//=====================================================KERANJANG

app.get('/keranjang',function(req,res){
    if(req.session.username==null){
        res.redirect('/')
    }
    else{
    connection.query('select krg.id,nama_produk,warna,ukuran,stock,Kuantitas,Price,(Kuantitas*Price) as total_harga from produk pr join produk_warna pw on pr.id = pw.id_produk JOIN ukuran_produk up on pw.id = up.idproduk_warna JOIN keranjang krg on up.id = krg.id_ukuranproduk' ,function (err,rows,field) {
        res.render(__dirname+'/user/keranjang' , {keranjang : rows, dataheader: req.session.username})
        console.log(rows)
        })
    }
})

//=======================================================INVOICE DETAIL

// ====================================================INVOICE 

app.post('/tambahinvoice' , url , function(req,res){
    conn.query('select * us.id,from produk pr join produk_warna pw on pr.id=pw.id_produk join ukuran_produk up on pw.id=up.idproduk_warna join keranjang krj on up.id=krj.id_ukuranproduk join user us on krj.id=us.id_user',function(err,cartval){
        connection.query('insert into invoice_data set ? ' , {
            id_user : req.session.userid,
            kode_invoice : "INV"+ req.session.userid + (new Date).getMonth() + (new Date).getHours() + (new Date).getSeconds(),
            total_harga : req.body.grandtotal,
            nama_penerima : req.body.namapenerima,
            alamat_penerima : req.body.alamatpenerima,
            telp : req.body.nomorhp,
            tanggal : new Date
            })
 
        cartval.forEach(x => {
                connection.query('insert into invoice_detail set ? ' , {
                    kode_invoice : "INV"+ req.session.userid + (new Date).getMonth() + (new Date).getHours() + (new Date).getSeconds(),
                    nama_produk : x.nama_produk,
                    harga : x.harga,
                    warna : x.warna,
                    ukuran : x.ukuran,
                    qty : x.qty
                })
 
            conn.query('select stok from produk_size where ? ' ,
             {
                 id : x.id_produk_size
             },
             function (err,detailinv)
             {
            console.log(detailinv)
                
                conn.query('update produk_size set ? where ? ' ,
            [
                {
                    stok : detailinv[0].stok - x.qty
                },
                {
                    id : x.id_produk_size
                }    
            ])
 
            })    
 
        });
            conn.query('delete from cart where ? ',
            {
                id_user : req.session.userid
            })
 
        })
    res.redirect('/home')
 })
 
 app.get('/userlogin/invoicedetail/:id' , function(req,res){
    connection.query(' select * from invoice_data where ? ' ,
    {
        kode_invoice : req.params.id
    },
    function(err,row1)
    {
        connection.query('select * from invoice_detail where ?',
        {
            kode_invoice : req.params.id
        },
        function(err,row2)
        {
            res.render(__dirname+'/views/invoicedetail', {data1 : row1 , data2 : row2 , dataheader : req.session.username,role : req.session.role})
        })
    
    })
 })

//====================================================== HALAMAN REGISTER

app.get('/formregister',function(req,res){
    res.render(__dirname+'/userlogin/formregister');
})

app.post('/register',url,function(req,res){
    var sql = 'select * from userlogin where username = ?';
    connection.query(sql,[req.body.username],function (err,rows){
        if (rows.length>0 ){
            res.render(__dirname+'/userlogin/formregister',{
                notif : 'Maaf , username sudah ada yang menggunakan'
            });         
        }
        else{   
            connection.query('insert into userdata set ?',{
                fullname : req.body.namalengkap,
                email: req.body.clientemail,
                phonenumber: req.body.clientphone
            }),
            connection.query('insert into userlogin set ?',{
                username:req.body.username,
                password:req.body.password
            })
            res.redirect('/');
        }
    })
})

app.listen(3000, console.log('run')) 