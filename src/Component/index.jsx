import React, {Component, PropTypes} from 'react';
import pureRender from 'pure-render-decorator';
import {History, Link } from 'react-router';
import { connect } from 'react-redux';
import { is, fromJS} from 'immutable';
import {Tool} from '../Config/Tool';
import {Header,template} from './common/mixin';


class Main extends Component {
    constructor() {
        super();
        this.state = {
            destination:'',  //接收者
            lssuer:'',   //发行者
            asset:'',   //资产
            amount:[],    //发送数量
            memo:[],    //备注
            postProduct:[], //上传的商品信息
            serverId:'',   // 图片id
            picSrc:'',     //图片src
            saleOldvalue:'',    //金额上次input值
            preventMountSubmit:true,//防止重复提交
        }

        //格式
        this.changeValue = (type,event) => {
            if (type === 'money') {
                let value = event.target.value;
                if((/^\d*?\.?\d{0,2}?$/gi).test(value)){
                    if ((/^0+[1-9]+/).test(value)) {
                        value = value.replace(/^0+/,'');
                    }
                    if ((/^0+0\./).test(value)) {
                        value = value.replace(/^0+/,'0');
                    }
                    value = value.replace(/^\./gi,'0.');
                    this.state.saleOldvalue = value;
                    this.state.inputLength = value.length;
                }else{
                      value = this.state.saleOldvalue;
                }
                this.setState({
                    destination:value
                })
            }else if (type === 'name') {
                this.setState({
                    name:event.target.value
                })
            }else if(type === 'phone'){
                let value = event.target.value.replace(/\D/gi,'')
                this.setState({
                    phone:value
                })
            }
        }

        this.postInform = () => {
            if (this.state.destination == '') {
                Tool.alert('请输入1');
            }else if (this.state.asset == '') {
                Tool.alert('请输入2');
            }else if (this.state.lssuer == ''||!/^1\d{10}$/.test(this.state.lssuer)) {
                Tool.alert('请输入3');
            }else if (this.state.postProduct.length == 0) {
                Tool.alert('请选择4');
            }else if (this.state.picSrc !== ''&&this.state.serverId == '') {
                Tool.alert('图片上传失败，请重新上传图片');
            }else if (this.state.serverId == '') {
                Tool.alert('请上传售卖发票凭证');
            }else{
                if (this.state.postProduct instanceof Object) {
                    this.state.postProduct = JSON.stringify(this.state.postProduct);
                }
                if (this.state.preventMountSubmit) {
                    this.state.preventMountSubmit == false;
                    this.props.getData('/sales/sales/input',{sales_money:this.state.destination,customers_name :this.state.asset,customers_phone :this.state.lssuer,products :this.state.postProduct,invoice_ids :this.state.serverId},(res) => {
                        if (res.http_code == 200) {
                            Tool.alert(res.data.msg);
                            this.setState({
                                destination:'',
                                name:'',
                                phone:'',
                                products:[],
                                serverId:'',
                                picSrc:'',
                                postProduct:[],
                                preventMountSubmit:true
                            })
                        }else{
                            this.state.preventMountSubmit = true;
                            Tool.alert(res.msg)
                        }
                    },'input')
                }
            }
        }

        this.deleteImg = () => {
            this.setState({picSrc:'',serverId:''})
        }  
        
    }

    componentWillMount() {
        let params = this.props.location.query;
        if (this.props.producRecord.productList&&this.props.location.search!=='') {
            let {productList} = this.props.producRecord;
            let num = 0;
            productList.forEach((item,index) => {
                if (item.chooseState&&item.num>0) {
                    this.state.products[num] = [item.productName,item.num.toString()];
                    this.state.postProduct[num] = {};
                    this.state.postProduct[num]['id'] = item.id;
                    this.state.postProduct[num]['quantity'] = item.num;
                    num++;
                }
            })
        }
        this.state.destination = params.destination||'';
        this.state.asset = params.asset||'';
        this.state.lssuer = params.lssuer||'';
        this.state.amount = params.amount||'';
        this.state.memo = params.memo||'';
        this.state.serverId = params.serverId||'';
    }
   
    render() {
        let products = this.state.products;
        return (
            <div className="component_container index_module">
                
                <Header nav saleRecord title='block.lol'/>
                <div className='index_tip'>
                    <span className='tip_text'>发送</span>
                </div>

                <form className='form_style'>
                    <div className='input_container'>
                        <span className='input_descript'>Destination</span>
                        <input type="text" value={this.state.destination} placeholder='Contact name, Stellar address or account ID' onChange={this.changeValue.bind(this,'money')}/>
                    </div>
                    <div className='input_container'>
                        <span className='input_descript'>Asset</span>
                        <input type="text" value={this.state.asset} placeholder='Asset' onChange={this.changeValue.bind(this,'Asset')}/>
                    </div>
                    <div className='input_container'>
                        <span className='input_descript'>lssuer</span>
                        <input type="text" maxLength='11' value={this.state.lssuer} placeholder='' onChange={this.changeValue.bind(this,'lssuer')}/>
                    </div>
                    <div className='input_container'>
                        <span className='input_descript'>Amount</span>
                        <input type="text" maxLength='11' value={this.state.amount} placeholder='' onChange={this.changeValue.bind(this,'amount')}/>
                    </div>
                    <div className='input_container'>
                        <span className='input_descript'>Memo</span>
                        <input type="text" maxLength='11' value={this.state.memo} placeholder='' onChange={this.changeValue.bind(this,'memo')}/>
                    </div>
                </form>

                {/* <div className='index_tip'>
                    <span className='tip_text'>请选择销售的产品</span>
                </div>

                <div className='choose_product'>
                    <Link to={'/chooseProducts?destination='+this.state.destination+'&name='+this.state.asset+'&phone='+this.state.lssuer+'&picSrc='+this.state.picSrc+'&serverId='+this.state.serverId} className={products.length > 0 ? 'showIcon':'link_choose'}>{products.length > 0 ? '':'请选择销售的产品'}</Link>
                    <ul  className={`choosed_ul clear ${products.length > 0 ? 'show':'hide'}`}>
                        {
                            products.length > 0 ?products.map((item,index) => {
                                return <li key={index} className='product_li left'>
                                    <span className='product_style product_name ellips' style={{maxWidth:`${4.8-item[1].length*0.6}rem`}}>{item[0]}</span>
                                    <span className='product_style'>x</span>
                                    <span className='product_style'>{item[1]}</span>
                                </li>
                            }):null
                        }
                    </ul>
                </div> */}

                {/* <div className='index_tip'>
                    <span className='tip_text'>请上传售卖发票凭证</span>
                </div>
                {
                    this.state.picSrc !== ''?<div className='img_container'>
                        <span className='delet_img' onClick={this.deleteImg}></span>
                        <img src={this.state.picSrc} className='chooseImg'/>
                    </div>:<div className='choosePic' onClick={this.chooseImage}>
                    <span className='choose_button'>请点击上传凭证</span>
                </div>
                } */}
                
                <div className='submit' onClick={this.postInform}>
                    提交
                </div>
            </div>
        )
    }
    
    componentWillUnmount() {
        cancelAnimationFrame(this.state.requestID);
    }
}

export default template({
    id: 'index',  //应用关联使用的redux
    component: Main,//接收数据的组件入口
    url: ''
});

