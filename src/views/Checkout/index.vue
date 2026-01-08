<script setup>
import { onMounted, ref, computed } from 'vue';
import { getCheckoutInfoApi, createOrderApi } from '@/apis/checkout';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { addAddressApi, editAddressApi, delAddressApi } from '@/apis/address';
import { ElMessage } from 'element-plus';
import { regionData } from 'element-china-area-data'; 
const cartStore = useCartStore()
const router = useRouter()

const checkInfo = ref({})  // 订单对象
const curAddress = ref({})  // 地址对象
const activeAddress = ref({})  // 当前选中的地址对象
const defaultAddress = ref({})  // 默认地址对象
const showDialog = ref(false)
const addDialog = ref(false)

const getCheckoutInfo = async () => {
    // 调用接口获取订单信息
    const res = await getCheckoutInfoApi()
    checkInfo.value = res.result
    defaultAddress.value = res.result.userAddresses.find((i) => !i.isDefault)
    curAddress.value =defaultAddress.value || res.result?.userAddresses[0]
    activeAddress.value = curAddress.value
}

// 切换地址
const switchAddress = (item) => {
    activeAddress.value = item
}
const cancelAddress = () => {
    showDialog.value = false
    activeAddress.value = curAddress.value
}
const confirmAddress = () => {
    curAddress.value = activeAddress.value
    showDialog.value = false
    activeAddress.value = curAddress.value
}

// 提交订单
const createOrder = async () => {
    if(!curAddress.value.id) {
        ElMessage({
            type: 'warning',
            message: '请先选择收货地址'
        })
        return;
    }
    const res = await createOrderApi({
        deliveryTimeType: 1,
        payType: 1,
        payChannel: 1,
        buyerMessage: '',
        goods: checkInfo.value.goods.map((item) => {
            return {
                skuId: item.skuId,
                count: item.count
            }
        }),
        addressId: curAddress.value.id
    })
    const orderId = res.result.id
    // 跳转到支付页面
    router.push({
        path: '/pay',
        query: {
            orderId
        }
    })
    // 更新购物车
    cartStore.updateCartList()
}

// 添加地址
const locationOptions = ['家', '公司', '学校', '父母', '朋友', '其他'];
const addressForm = ref({
    receiver: '',
    contact: '',
    provinceCode: '',
    cityCode: '',
    countyCode: '',
    fullLocation: '',
    address: '',
    postalCode: '',
    addressTags: '',
    isDefault: 1,
    region: []
});

const addressRules = {
  receiver: [
    { required: true, message: '收货人不能为空', trigger: 'blur' },
  ],
  contact: [
    { required: true, message: '联系方式不能为空', trigger: 'blur' },
  ],
  region: [
    { type: 'array', required: true, message: '省市区不能为空', trigger: 'change' },
  ],
  address: [
    { required: true, message: '详细地址不能为空', trigger: 'blur' },
  ],
  postalCode: [
    { required: true, message: '邮政编码不能为空', trigger: 'blur' },
  ],
  addressTags: [
    { required: true, message: '地址标签不能为空', trigger: 'change' },
  ]
}

const addressFormRef = ref(null);
const addressCascaderRef = ref(null);
// 省市区级联配置（仅选择编码）
const cascaderProps = {
    options: regionData, // 省-市-区三级
    label: 'label',
    value: 'value', // 选择后返回编码（如['110000', ...])
    expandTrigger: 'click',
};

const regionChang = (value) => {
    console.log(value);
    if(value && value.length === 3) {
        addressForm.value.provinceCode = value[0];
        addressForm.value.cityCode = value[1];
        addressForm.value.countyCode = value[2];
        // 拼接 fullLocation
        if (addressCascaderRef.value) {
            const checkedNodes = addressCascaderRef.value.getCheckedNodes();
            if (checkedNodes && checkedNodes.length > 0) {
                // checkedNodes[0] 是当前选中的节点对象
                // pathLabels 是一个数组，例如 ['广东省', '广州市', '天河区']
                const labels = checkedNodes[0].pathLabels;
                // 使用空格拼接成字符串
                addressForm.value.fullLocation = labels.join(' '); 
            }
        }
    } else {
        addressForm.value.fullLocation = '';
        addressForm.value.provinceCode = '';
        addressForm.value.cityCode = '';
        addressForm.value.countyCode = '';
    }
}

const openAddDialog = () => {
    addDialog.value = true;
    addressForm.value = {
        receiver: '',
        contact: '',
        provinceCode: '',
        cityCode: '',
        countyCode: '',
        fullLocation: '',
        address: '',
        postalCode: '',
        addressTags: '',
        isDefault: 1,
        region: []
    };
    if(addressFormRef.value) {
        addressFormRef.value.resetFields();
    }
}

const updateAddress = async () => {
    if(!addressFormRef.value) return;
    try {
        await addressFormRef.value.validate();
        // 提交的参数
        const submitData = {...addressForm.value}
        delete submitData.region;
        // 判断是添加还是编辑
        if(addressForm.value.id) {
          await editAddressApi(addressForm.value.id, submitData);
          ElMessage({
            type: 'success',
            message: '地址修改成功'
          })
        } else{
            await addAddressApi(submitData);
            ElMessage({
                type: 'success',
                message: '地址添加成功'
            })
        }
        addDialog.value = false
        await getCheckoutInfo()
    } catch (error) {
        return;
    }
}
const cancelAddAddress = () => {
    addDialog.value = false;
    addressFormRef.value.resetFields();
    addressForm.value.region = [];   
}

// 删除地址
const deleteAddress = async (id) => {
    try{
        const preCurId = curAddress.value.id
        await delAddressApi(id)
        ElMessage({
            type: 'success',
            message: '地址删除成功'
        })
        await getCheckoutInfo()
        if(id === preCurId) {
            curAddress.value = defaultAddress.value || checkInfo.value?.userAddresses[0]
        }
    } catch (error) {
        return;
    }
}

const editClose = () => {
    activeAddress.value = curAddress.value
}
const addClose = () => {
    addressFormRef.value.resetFields();
}

// 编辑地址
const editAddress = (item) => {
    addDialog.value = true;
    addressForm.value = { ...item, region: [item.provinceCode, item.cityCode, item.countyCode] };
}
onMounted(() => {
    getCheckoutInfo()
})
</script>

<template>
  <div class="xtx-pay-checkout-page">
    <div class="container">
      <div class="wrapper">
        <!-- 收货地址 -->
        <h3 class="box-title">收货地址</h3>
        <div class="box-body">
          <div class="address">
            <div class="text">
              <div class="none" v-if="!curAddress">您需要先添加收货地址才可提交订单。</div>
              <ul v-else>
                <li><span>收<i></i>货<i></i>人：</span>{{ curAddress.receiver }}</li>
                <li><span>联系方式：</span>{{ curAddress.contact }}</li>
                <li><span>收货地址：</span>{{ curAddress.fullLocation }} {{ curAddress.address }}</li>
              </ul>
            </div>
            <div class="action">
              <el-button size="large" @click="showDialog = true">管理地址</el-button>
              <el-button size="large" @click="openAddDialog">添加地址</el-button>
            </div>
          </div>
        </div>
        <!-- 商品信息 -->
        <h3 class="box-title">商品信息</h3>
        <div class="box-body">
          <table class="goods">
            <thead>
              <tr>
                <th width="520">商品信息</th>
                <th width="170">单价</th>
                <th width="170">数量</th>
                <th width="170">小计</th>
                <th width="170">实付</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in checkInfo.goods" :key="i.skuId">
                <td>
                  <RouterLink :to="`/detail/${i.id}`" class="info">
                    <img :src="i.picture" alt="">
                    <div class="right">
                      <p>{{ i.name }}</p>
                      <p>{{ i.attrsText }}</p>
                    </div>
                  </RouterLink>
                </td>
                <td>&yen;{{ i.price }}</td>
                <td>{{ i.price }}</td>
                <td>&yen;{{ i.totalPrice }}</td>
                <td>&yen;{{ i.totalPayPrice }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 配送时间 -->
        <h3 class="box-title">配送时间</h3>
        <div class="box-body">
          <a class="my-btn active" href="javascript:;">不限送货时间：周一至周日</a>
          <a class="my-btn" href="javascript:;">工作日送货：周一至周五</a>
          <a class="my-btn" href="javascript:;">双休日、假日送货：周六至周日</a>
        </div>
        <!-- 支付方式 -->
        <h3 class="box-title">支付方式</h3>
        <div class="box-body">
          <a class="my-btn active" href="javascript:;">在线支付</a>
          <a class="my-btn" href="javascript:;">货到付款</a>
          <span style="color:#999">货到付款需付5元手续费</span>
        </div>
        <!-- 金额明细 -->
        <h3 class="box-title">金额明细</h3>
        <div class="box-body">
          <div class="total">
            <dl>
              <dt>商品件数：</dt>
              <dd>{{ checkInfo.summary?.goodsCount }}件</dd>
            </dl>
            <dl>
              <dt>商品总价：</dt>
              <dd>¥{{ checkInfo.summary?.totalPrice.toFixed(2) }}</dd>
            </dl>
            <dl>
              <dt>运<i></i>费：</dt>
              <dd>¥{{ checkInfo.summary?.postFee.toFixed(2) }}</dd>
            </dl>
            <dl>
              <dt>应付总额：</dt>
              <dd class="price">{{ checkInfo.summary?.totalPayPrice.toFixed(2) }}</dd>
            </dl>
          </div>
        </div>
        <!-- 提交订单 -->
        <div class="submit">
          <el-button @click="createOrder" type="primary" size="large" >提交订单</el-button>
        </div>
      </div>
    </div>
  </div>
  <!-- 管理地址 -->
  <el-dialog @close="editClose" v-model="showDialog" title="管理收货地址" width="30%" center>
    <div class="addressWrapper">
        <div class="text item" :class="{active : item.id === activeAddress?.id}" @click="switchAddress(item)" v-for="item in checkInfo.userAddresses"  :key="item.id">
            <ul>
            <li><span>收货人：</span>{{ item.receiver }} </li>
            <li><span>联系方式：</span>{{ item.contact }}</li>
            <li><span>收货地址：</span>{{ item.fullLocation + item.address }}</li>
            </ul>
            <div item-actions style="display:flex; flex-direction:column; gap:8px; align-items:flex-end; margin-left: auto; ">
            <el-popconfirm @confirm="deleteAddress(item.id)" width="220" title="确定要删除该地址吗？">
                <template #reference>
                    <el-button @confirm="deleteAddress(item.id)" style="color:#f56c6c;">删除</el-button>
                </template>
            </el-popconfirm>
            <el-button @click="editAddress(item)">编辑</el-button>
            </div>
        </div>
    </div>
    <template #footer>
        <span class="dialog-footer">
            <el-button @click="cancelAddress">取消</el-button>
            <el-button @click="confirmAddress" type="primary">确定</el-button>
        </span>
    </template>
  </el-dialog>
  <!-- 添加地址 -->
   <el-dialog @close="addClose" center v-model="addDialog" title="编辑收货地址" width="30%">
    <div class="addressWrapper">
        <el-form :rules="addressRules" ref="addressFormRef" :model="addressForm">
            <el-form-item label="收 货 人：" prop="receiver">
                <el-input v-model="addressForm.receiver" placeholder="请输入收货人姓名"></el-input>
            </el-form-item>
            <el-form-item label="联系方式：" prop="contact">
                <el-input v-model="addressForm.contact" placeholder="请输入收货人联系方式"></el-input>
            </el-form-item>
            <el-form-item label="省市区(县): " prop="region">
                <el-cascader
                    ref="addressCascaderRef"
                    v-model="addressForm.region"
                    :options="cascaderProps.options"
                    :props="cascaderProps"
                    clearable
                    @change="regionChang"
                    placeholder="请选择收货人地区"
                />
            </el-form-item>
            <el-form-item label="详细地址：" prop="address">
                <el-input v-model="addressForm.address" placeholder="请输入收货人详细地址"></el-input>
            </el-form-item>
            <el-form-item label="邮政编码：" prop="postalCode">
                <el-input v-model="addressForm.postalCode" placeholder="请输入收货人邮政编码"></el-input>
            </el-form-item>
            <el-form-item label="地址标签：" prop="addressTags">
                <el-segmented v-model="addressForm.addressTags" :options="locationOptions" />
            </el-form-item>
            <el-form-item label="默认地址：" prop="isDefault">
                <el-checkbox v-model="addressForm.isDefault" :true-value="0" :false-value="1"></el-checkbox>
            </el-form-item>
        </el-form>
    </div>
    <template #footer>
        <span class="dialog-footer">
            <el-button @click="cancelAddAddress">取消</el-button>
            <el-button @click="updateAddress" type="primary">确定</el-button>
        </span>
    </template>
   </el-dialog>
</template>

<style scoped lang="scss">
.xtx-pay-checkout-page {
  margin-top: 20px;

  .wrapper {
    background: #fff;
    padding: 0 20px;

    .box-title {
      font-size: 16px;
      font-weight: normal;
      padding-left: 10px;
      line-height: 70px;
      border-bottom: 1px solid #f5f5f5;
    }

    .box-body {
      padding: 20px 0;
    }
  }
}

.address {
  border: 1px solid #f5f5f5;
  display: flex;
  align-items: center;

  .text {
    flex: 1;
    min-height: 90px;
    display: flex;
    align-items: center;

    .none {
      line-height: 90px;
      color: #999;
      text-align: center;
      width: 100%;
    }

    >ul {
      flex: 1;
      padding: 20px;

      li {
        line-height: 30px;

        span {
          color: #999;
          margin-right: 5px;

          >i {
            width: 0.5em;
            display: inline-block;
          }
        }
      }
    }

    >a {
      color: $xtxColor;
      width: 160px;
      text-align: center;
      height: 90px;
      line-height: 90px;
      border-right: 1px solid #f5f5f5;
    }
  }

  .action {
    width: 420px;
    text-align: center;

    .btn {
      width: 140px;
      height: 46px;
      line-height: 44px;
      font-size: 14px;

      &:first-child {
        margin-right: 10px;
      }
    }
  }
}

.goods {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;

  .info {
    display: flex;
    text-align: left;

    img {
      width: 70px;
      height: 70px;
      margin-right: 20px;
    }

    .right {
      line-height: 24px;

      p {
        &:last-child {
          color: #999;
        }
      }
    }
  }

  tr {
    th {
      background: #f5f5f5;
      font-weight: normal;
    }

    td,
    th {
      text-align: center;
      padding: 20px;
      border-bottom: 1px solid #f5f5f5;

      &:first-child {
        border-left: 1px solid #f5f5f5;
      }

      &:last-child {
        border-right: 1px solid #f5f5f5;
      }
    }
  }
}

.my-btn {
  width: 228px;
  height: 50px;
  border: 1px solid #e4e4e4;
  text-align: center;
  line-height: 48px;
  margin-right: 25px;
  color: #666666;
  display: inline-block;

  &.active,
  &:hover {
    border-color: $xtxColor;
  }
}

.total {
  dl {
    display: flex;
    justify-content: flex-end;
    line-height: 50px;

    dt {
      i {
        display: inline-block;
        width: 2em;
      }
    }

    dd {
      width: 240px;
      text-align: right;
      padding-right: 70px;

      &.price {
        font-size: 20px;
        color: $priceColor;
      }
    }
  }
}

.submit {
  text-align: right;
  padding: 60px;
  border-top: 1px solid #f5f5f5;
}

.addressWrapper {
  max-height: 500px;
  overflow-y: auto;
}

.text {
  flex: 1;
  min-height: 90px;
  display: flex;
  align-items: center;

  &.item {
    border: 1px solid #f5f5f5;
    margin-bottom: 10px;
    cursor: pointer;

    &.active,
    &:hover {
      border-color: $xtxColor;
      background: color.adjust($xtxColor, $lightness: 50%);
    }
    >ul {
      padding: 10px;
      font-size: 14px;
      line-height: 30px;
    }
  }
}
</style>