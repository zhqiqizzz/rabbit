<script setup>
import { onMounted, ref, computed } from 'vue';
import { getCheckoutInfoApi, createOrderApi } from '@/apis/checkout';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { addAddressApi, editAddressApi } from '@/apis/address';
import { ElMessage } from 'element-plus';
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
    curAddress.value = res.result.userAddresses.find((i) => !i.isDefault)
    defaultAddress.value = curAddress.value
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
    address: '',
    postalCode: '',
    addressTags: '',
    isDefault: 1
});
const addressRules = {
  receiver: [
    { required: true, message: '收货人不能为空', trigger: 'blur' },
  ],
  contact: [
    { required: true, message: '联系方式不能为空', trigger: 'blur' },
  ],
  provinceCode: [
    { required: true, message: '省份不能为空', trigger: 'blur' },
  ],
  cityCode: [
    { required: true, message: '城市不能为空', trigger: 'blur' },
  ],
  countyCode: [
    { required: true, message: '区县不能为空', trigger: 'blur' },
  ],
  address: [
    { required: true, message: '详细地址不能为空', trigger: 'blur' },
  ],
  postalCode: [
    { required: true, message: '邮政编码不能为空', trigger: 'blur' },
  ],
  addressTags: [
    { required: true, message: '地址标签不能为空', trigger: 'change' },
  ],
}
const fullLocation = computed(() => {
    return addressForm.value?.provinceCode + addressForm.value?.cityCode + addressForm.value?.countyCode + addressForm.value?.address;
});
const addressFormRef = ref(null);
const addAddress = async () => {
    if(!addressFormRef.value) return;
    try {
        await addressFormRef.value.validate();
        await addAddressApi({...addressForm.value, fullLocation: fullLocation.value });
        ElMessage({
            type: 'success',
            message: '地址添加成功'
        })
        if(!addressForm.value.isDefault) {
            await editAddressApi(defaultAddress.value.id, {...defaultAddress.value, isDefault: 1})
        }
        await getCheckoutInfo()
        addDialog.value = false;
        addressFormRef.value.resetFields();
    } catch (error) {
        return;
    }
}
const cancelAddAddress = () => {
    addDialog.value = false;
    addressFormRef.value.resetFields();
}
const defaultChange = (val) => {
    addressForm.value.isDefault = val ? 0 : 1;
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
              <el-button size="large" @click="showDialog = true">切换地址</el-button>
              <el-button size="large" @click="addDialog = true">添加地址</el-button>
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
  <!-- 切换地址 -->
  <el-dialog v-model="showDialog" title="切换收货地址" width="30%" center>
    <div class="addressWrapper">
        <div class="text item" :class="{active : item.id === activeAddress.id}" @click="switchAddress(item)" v-for="item in checkInfo.userAddresses"  :key="item.id">
            <ul>
            <li><span>收货人：</span>{{ item.receiver }} </li>
            <li><span>联系方式：</span>{{ item.contact }}</li>
            <li><span>收货地址：</span>{{ item.fullLocation + item.address }}</li>
            </ul>
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
   <el-dialog center v-model="addDialog" title="编辑收货地址" width="30%">
    <div class="addressWrapper">
        <el-form :rules="addressRules" ref="addressFormRef" :model="addressForm">
            <el-form-item label="收 货 人：" prop="receiver">
                <el-input v-model="addressForm.receiver" placeholder="请输入收货人姓名"></el-input>
            </el-form-item>
            <el-form-item label="联系方式：" prop="contact">
                <el-input v-model="addressForm.contact" placeholder="请输入收货人联系方式"></el-input>
            </el-form-item>
            <el-form-item label="省份：" prop="provinceCode">
                <el-input v-model="addressForm.provinceCode" placeholder="请输入收货人省份"></el-input>
            </el-form-item>
            <el-form-item label="城市：" prop="cityCode">
                <el-input v-model="addressForm.cityCode" placeholder="请输入收货人城市"></el-input>
            </el-form-item>
            <el-form-item label="区县：" prop="countyCode">
                <el-input v-model="addressForm.countyCode" placeholder="请输入收货人区县"></el-input>
            </el-form-item>
            <el-form-item label="详细地址：" prop="address">
                <el-input v-model="addressForm.address" placeholder="请输入收货人详细地址"></el-input>
            </el-form-item>
            <el-form-item label="邮政编码：" prop="postalCode">
                <el-input v-model="addressForm.postalCode" placeholder="请输入收货人邮政编码"></el-input>
            </el-form-item>
            <el-form-item label="地址标签" prop="addressTags">
                <el-segmented v-model="addressForm.addressTags" :options="locationOptions" />
            </el-form-item>
            <el-form-item label="默认地址" prop="isDefault">
                <el-checkbox @change="defaultChange"></el-checkbox>
            </el-form-item>
        </el-form>
    </div>
    <template #footer>
        <span class="dialog-footer">
            <el-button @click="cancelAddAddress">取消</el-button>
            <el-button @click="addAddress" type="primary">确定</el-button>
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