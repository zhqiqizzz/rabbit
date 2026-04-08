<script setup>
import { ElMessage } from "element-plus";
import "element-plus/es/components/message/style/css";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import SlideVerify from "vue3-slide-verify";
import "vue3-slide-verify/dist/style.css";
import VerifyCode from "@/components/VerifyCode.vue";

const userStore = useUserStore();
const router = useRouter();
const loginFormRef = ref(null);
const verifyCodeRef = ref(null);
const sliderVerifyRef = ref(null);
const currentCaptcha = ref("");

const loginForm = ref({
  account: "",
  password: "",
  captcha: "",
  sliderVerified: false,
  privacyAgree: true,
});

const loginRules = {
  account: [
    { required: true, message: "用户名不能为空", trigger: "blur" },
    { min: 3, max: 14, message: "用户名长度在 3 到 14 位之间", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "用户名只能包含字母、数字和下划线",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "密码不能为空", trigger: "blur" },
    { min: 6, max: 14, message: "密码长度在 6 到 14 位之间", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9!@#$%^&*()_+\-=]+$/,
      message: "密码只能包含字母、数字和常见特殊字符",
      trigger: "blur",
    },
  ],
  captcha: [
    { required: true, message: "请输入图形验证码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error("请输入图形验证码"));
          return;
        }
        if (value.trim().toUpperCase() !== currentCaptcha.value) {
          callback(new Error("图形验证码不正确"));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
  sliderVerified: [
    {
      validator: (rule, value, callback) => {
        if (value) {
          callback();
          return;
        }
        callback(new Error("请完成滑块验证"));
      },
      trigger: "change",
    },
  ],
  privacyAgree: [
    {
      validator: (rule, value, callback) => {
        if (value) {
          callback();
          return;
        }
        callback(new Error("请阅读并同意隐私条款和服务条款"));
      },
      trigger: "change",
    },
  ],
};

const handleCaptchaChange = (code) => {
  currentCaptcha.value = code;
};

const resetCaptcha = () => {
  loginForm.value.captcha = "";
  verifyCodeRef.value?.refreshCode();
};

const resetSlider = () => {
  loginForm.value.sliderVerified = false;
  sliderVerifyRef.value?.refresh();
};

const resetHumanVerification = () => {
  resetCaptcha();
  resetSlider();
};

const handleSliderSuccess = () => {
  loginForm.value.sliderVerified = true;
};

const handleSliderFail = () => {
  loginForm.value.sliderVerified = false;
};

const handleSliderRefresh = () => {
  loginForm.value.sliderVerified = false;
};

const handleSliderAgain = () => {
  loginForm.value.sliderVerified = false;
  sliderVerifyRef.value?.refresh();
};

const doLogin = async () => {
  if (!loginFormRef.value) return;

  const { account, password } = loginForm.value;
  try {
    await loginFormRef.value.validate();
    await userStore.getUserInfo({ account, password });
    ElMessage({
      message: "登录成功",
      type: "success",
    });
    router.replace({ path: "/" });
  } catch (error) {
    resetHumanVerification();
  }
};
</script>

<template>
  <div>
    <header class="login-header">
      <div class="container m-top-20">
        <h1 class="logo">
          <RouterLink to="/">小兔鲜</RouterLink>
        </h1>
        <RouterLink class="entry" to="/">
          进入网站首页
          <i class="iconfont icon-angle-right"></i>
          <i class="iconfont icon-angle-right"></i>
        </RouterLink>
      </div>
    </header>
    <section class="login-section">
      <div class="wrapper">
        <nav>
          <a href="javascript:;">账户登录</a>
        </nav>
        <div class="account-box">
          <div class="form">
            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              label-position="right"
              label-width="60px"
              status-icon
            >
              <el-form-item prop="account" label="账户">
                <el-input v-model="loginForm.account" />
              </el-form-item>
              <el-form-item prop="password" label="密码">
                <el-input v-model="loginForm.password" type="password" show-password />
              </el-form-item>
              <el-form-item prop="captcha" label="图码">
                <VerifyCode
                  ref="verifyCodeRef"
                  v-model="loginForm.captcha"
                  @change="handleCaptchaChange"
                />
              </el-form-item>
              <el-form-item prop="sliderVerified" label="滑块" class="slider-form-item">
                <SlideVerify
                  ref="sliderVerifyRef"
                  class="login-slider"
                  slider-text="向右滑动完成验证"
                  :w="320"
                  :h="160"
                  :l="38"
                  :r="10"
                  :accuracy="1"
                  @success="handleSliderSuccess"
                  @fail="handleSliderFail"
                  @refresh="handleSliderRefresh"
                  @again="handleSliderAgain"
                />
              </el-form-item>
              <el-form-item label-width="22px" prop="privacyAgree">
                <el-checkbox v-model="loginForm.privacyAgree" size="large">
                  我已同意隐私条款和服务条款
                </el-checkbox>
              </el-form-item>
              <el-button @click="doLogin" size="large" class="subBtn">点击登录</el-button>
            </el-form>
          </div>
        </div>
      </div>
    </section>

    <footer class="login-footer">
      <div class="container">
        <p>
          <a href="javascript:;">关于我们</a>
          <a href="javascript:;">帮助中心</a>
          <a href="javascript:;">售后服务</a>
          <a href="javascript:;">配送与验收</a>
          <a href="javascript:;">商务合作</a>
          <a href="javascript:;">搜索推荐</a>
          <a href="javascript:;">友情链接</a>
        </p>
        <p>CopyRight &copy; 小兔鲜儿</p>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.login-header {
  background: #fff;
  border-bottom: 1px solid #e4e4e4;

  .container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .logo {
    width: 200px;

    a {
      display: block;
      height: 132px;
      width: 100%;
      text-indent: -9999px;
      background: url("@/assets/images/logo.png") no-repeat center 18px / contain;
    }
  }

  .sub {
    flex: 1;
    font-size: 24px;
    font-weight: normal;
    margin-bottom: 38px;
    margin-left: 20px;
    color: #666;
  }

  .entry {
    width: 120px;
    margin-bottom: 38px;
    font-size: 16px;

    i {
      font-size: 14px;
      color: $xtxColor;
      letter-spacing: -5px;
    }
  }
}

.login-section {
  background: url("@/assets/images/login-bg.png") no-repeat center / cover;
  min-height: 680px;
  position: relative;
  padding: 54px 0 40px;

  .wrapper {
    width: 460px;
    background: #fff;
    position: relative;
    margin-left: auto;
    margin-right: calc(50% - 290px);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    overflow: hidden;
    margin-right: 200px;
    nav {
      font-size: 14px;
      height: 64px;
      border-bottom: 1px solid #f5f5f5;
      display: flex;
      padding: 0 48px;
      align-items: center;

      a {
        flex: 1;
        line-height: 1;
        display: inline-block;
        font-size: 30px;
        font-weight: 500;
        position: relative;
        text-align: center;
        color: #303133;
      }
    }
  }
}

.login-footer {
  padding: 30px 0 50px;
  background: #fff;

  p {
    text-align: center;
    color: #999;
    padding-top: 20px;

    a {
      line-height: 1;
      padding: 0 10px;
      color: #999;
      display: inline-block;

      ~ a {
        border-left: 1px solid #ccc;
      }
    }
  }
}

.account-box {
  .toggle {
    padding: 15px 40px;
    text-align: right;

    a {
      color: $xtxColor;

      i {
        font-size: 14px;
      }
    }
  }

  .form {
    padding: 28px 32px 28px 24px;
  }
}

.account-box :deep(.el-form-item) {
  margin-bottom: 22px;
}

.account-box :deep(.el-form-item__label) {
  font-size: 15px;
  color: #606266;
}

.account-box :deep(.el-input__wrapper) {
  min-height: 42px;
}

.account-box :deep(.el-form-item__content) {
  line-height: normal;
}

.account-box :deep(.slider-form-item) {
  align-items: flex-start;
}

.account-box :deep(.slider-form-item .el-form-item__label) {
  padding-top: 12px;
}

.login-slider {
  width: 320px;
  max-width: 100%;
}

.account-box :deep(.login-slider .slide-verify) {
  width: 320px;
  max-width: 100%;
  overflow: hidden;
  border-radius: 6px;
  background: #f8fafc;
  position: relative;
  isolation: isolate;
  margin: 0 auto;
}

.account-box :deep(.login-slider .slide-verify-slider) {
  margin-top: 12px;
  border-radius: 4px;
}

.account-box :deep(.login-slider canvas) {
  display: block;
}

.account-box :deep(.login-slider .slide-verify-refresh-icon) {
  right: 8px;
  top: 8px;
  z-index: 2;
}

.account-box :deep(.login-slider .slide-verify-block) {
  z-index: 1;
}

.account-box :deep(.login-slider .slide-verify-loading) {
  border-radius: 6px;
}

.account-box :deep(.el-checkbox) {
  align-items: flex-start;
  white-space: normal;
}

.account-box :deep(.el-checkbox__label) {
  line-height: 1.5;
}

.subBtn {
  background: $xtxColor;
  width: 100%;
  color: #fff;
  min-height: 44px;
  margin-top: 8px;
}
</style>
