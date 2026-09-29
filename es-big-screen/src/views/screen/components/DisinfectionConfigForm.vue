<template>
  <section class="config-form-grid" aria-label="消杀配置表单">
    <article class="panel form-panel">
      <div class="panel-heading"><h2>消毒时段</h2><span>填写每日消杀计划时段</span></div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="config-form" aria-label="消毒时段表单">
        <div v-for="(period, index) in form.periods" :key="period.key" class="period-row">
          <el-form-item :label="'时段 ' + (index + 1) + ' 名称'" :prop="`periods.${index}.name`" class="field-name">
            <el-input v-model="period.name" placeholder="如：早间消杀" :maxlength="12" show-word-limit />
          </el-form-item>
          <el-form-item label="开始时间" :prop="`periods.${index}.start`" class="field-time">
            <el-time-select v-model="period.start" start="00:00" step="00:30" end="23:30" placeholder="选择开始时间" popper-class="dark-popper" />
          </el-form-item>
          <el-form-item label="结束时间" :prop="`periods.${index}.end`" class="field-time">
            <el-time-select v-model="period.end" start="00:00" step="00:30" end="23:30" placeholder="选择结束时间" popper-class="dark-popper" />
          </el-form-item>
          <el-form-item label="重复" class="field-repeat">
            <el-select v-model="period.repeat" popper-class="dark-popper">
              <el-option v-for="repeat in repeatOptions" :key="repeat" :label="repeat" :value="repeat" />
            </el-select>
          </el-form-item>
          <div class="field-toggle">
            <span>启用</span>
            <el-switch v-model="period.enabled" />
          </div>
          <el-button class="remove-button" :disabled="form.periods.length <= 1" @click="removePeriod(index)">删除</el-button>
        </div>
        <el-button class="add-button" @click="addPeriod">+ 添加时段</el-button>
      </el-form>
    </article>

    <article class="panel intensity-panel">
      <div class="panel-heading"><h2>消毒强度</h2><span>选择本次运行采用的强度</span></div>
      <el-form :model="form" label-position="top" class="config-form" aria-label="消毒强度表单">
        <el-form-item label="强度档位">
          <div class="intensity-list" role="radiogroup" aria-label="消毒强度">
            <button v-for="option in intensityOptions" :key="option.id" type="button" class="intensity-card" :class="{ selected: form.intensity === option.id }"
              :aria-checked="form.intensity === option.id" role="radio" @click="form.intensity = option.id">
              <span class="intensity-radio"></span>
              <span class="intensity-text"><strong>{{ option.name }}</strong><small>{{ option.desc }}</small><em>{{ option.usage }}</em></span>
            </button>
          </div>
        </el-form-item>
      </el-form>
      <div class="form-note"><span class="status-dot"></span>配置保存在本机内存（演示），不写入任何后端接口。</div>
      <div class="form-actions">
        <el-button type="primary" class="save-button" @click="saveConfig">保存配置</el-button>
        <el-button class="reset-button" @click="resetConfig">重置</el-button>
      </div>
      <p v-if="savedText" class="saved-text">{{ savedText }}</p>
    </article>
  </section>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { useDisinfectionStore } from '@/store'
import { intensityOptions, type DisinfectionPeriod } from '../mock/disinfection'

interface FormPeriod extends DisinfectionPeriod {
  key: number
}

const store = useDisinfectionStore()
const formRef = ref<FormInstance>()
const savedText = ref('')
const repeatOptions = ['每日', '工作日', '周末']

const form = reactive<{ periods: FormPeriod[]; intensity: typeof store.intensity }>({
  periods: store.periods.map((period, index) => ({ ...period, key: index })),
  intensity: store.intensity
})

const rules = {
  name: [{ required: true, message: '请填写时段名称', trigger: 'blur' }],
  start: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  end: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

function addPeriod() {
  form.periods.push({ key: Date.now(), id: 'period-' + Date.now(), name: '新增时段', start: '12:00', end: '13:00', repeat: '每日', enabled: true })
}
function removePeriod(index: number) {
  form.periods.splice(index, 1)
}

async function saveConfig() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  store.periods = form.periods.map(({ key, ...rest }) => ({ ...rest }))
  store.intensity = form.intensity
  store.save()
  savedText.value = '已于 ' + store.savedAt + ' 保存（演示）'
  ElMessage.success('消杀配置已保存（演示）')
}

function resetConfig() {
  store.reset()
  form.periods = store.periods.map((period, index) => ({ ...period, key: index }))
  form.intensity = store.intensity
  savedText.value = ''
}
</script>
<style scoped lang="scss">
.config-form-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 14px; min-height: 0; }
.config-form-grid :deep(.panel) { min-width: 0; min-height: 0; }
.form-panel { overflow-y: auto; scrollbar-width: thin; scrollbar-color: #385571 transparent; padding-right: 22px; }
.config-form { --el-switch-on-color: #3f8da0; max-width: 960px; }
.config-form :deep(.el-form-item) { margin-bottom: 0; }
.config-form :deep(.el-form-item__label) { color: #b9cbdc; font-size: 11px; padding-bottom: 7px; }
.config-form :deep(.el-input__wrapper), .config-form :deep(.el-select__wrapper) { background: #14283d; box-shadow: 0 0 0 1px #2b4458 inset; border-radius: 4px; }
.config-form :deep(.el-input__inner), .config-form :deep(.el-select__placeholder) { color: #d6e8f5; }
.config-form :deep(.el-input__wrapper:hover), .config-form :deep(.el-select__wrapper:hover) { box-shadow: 0 0 0 1px #3f7d91 inset; }
.config-form :deep(.el-input__wrapper.is-focus), .config-form :deep(.el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #3f97ad inset; }
.config-form :deep(.el-input__count) { color: #4c6b84; }
.period-row { display: grid; grid-template-columns: minmax(130px, 1.2fr) minmax(110px, 0.8fr) minmax(110px, 0.8fr) minmax(100px, 0.7fr) auto auto; gap: 12px; align-items: start; padding: 16px; margin-bottom: 12px; background: #101f31; border: 1px solid #23394e; border-radius: 4px; }
.field-name, .field-time, .field-repeat { min-width: 0; }
.field-toggle { display: flex; flex-direction: column; gap: 10px; padding-top: 3px; span { font-size: 11px; color: #b9cbdc; } }
.remove-button { height: 32px; margin-left: 2px; background: #14283d; border: 1px solid #5c3a44; color: #ff9cab; font-size: 12px; }
.remove-button.is-disabled, .remove-button.is-disabled:hover { background: #101f31; border-color: #2b4258; color: #4c6478; }
.add-button { width: 100%; margin: 2px 0 0; background: #14283d; border: 1px dashed #3a5a72; color: #8fdbe6; font-size: 12px; }
.add-button:hover { border-color: #3f97ad; color: #67d9e8; background: #163647; }
.intensity-panel { display: flex; flex-direction: column; }
.intensity-list { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.intensity-card { display: flex; align-items: flex-start; gap: 10px; width: 100%; padding: 12px; text-align: left; background: #14283d; border: 1px solid #233d53; border-radius: 4px; color: #adbed1; font: inherit; cursor: pointer; transition: border-color .2s, background .2s;
  &.selected { border-color: #3f97ad; background: #163647; }
  &:hover { border-color: #388597; }
  &:focus-visible { outline: 2px solid #66e0e9; outline-offset: 3px; } }
.intensity-radio { flex: none; width: 10px; height: 10px; margin-top: 3px; border: 1px solid #4a647e; border-radius: 50%; transition: border-color .2s, box-shadow .2s;
  .selected & { border-color: #66d8e4; box-shadow: inset 0 0 0 3px #163647, 0 0 0 1px #66d8e4; } }
.intensity-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; strong { font-size: 13px; font-weight: 500; color: #d3e6f3; } small { font-size: 10px; color: #8ba3ba; } em { font-size: 10px; color: #607b96; font-style: normal; } }
.form-note { display: flex; align-items: center; gap: 7px; margin: 18px 0 12px; color: #7e94aa; font-size: 10px; }
.form-actions { display: flex; gap: 10px; }
.save-button { flex: 1; height: 38px; border-color: #3f8da0; background: linear-gradient(90deg, #123f4d, #14586b); color: #9fe6ee; font-size: 13px; letter-spacing: 2px; }
.save-button:hover { background: linear-gradient(90deg, #14586b, #17677e); color: #bff2f7; }
.reset-button { height: 38px; padding: 0 22px; background: #14283d; border: 1px solid #35536b; color: #8fa9be; font-size: 12px; }
.reset-button:hover { color: #c9dceb; border-color: #4a6a85; }
.saved-text { margin-top: 12px; color: #54cbb9; font-size: 11px; }
@media (max-width: 1200px) { .config-form-grid { grid-template-columns: minmax(0, 1fr); } .period-row { grid-template-columns: repeat(2, minmax(0, 1fr)) auto auto; } }
@media (max-width: 680px) { .period-row { grid-template-columns: 1fr; } .intensity-panel { margin-top: 14px; } }
</style>
<style lang="scss">
.dark-popper.el-popper { background: #12263b; border: 1px solid #35536b; border-radius: 4px; }
.dark-popper .el-popper__arrow::before { background: #12263b; border-color: #35536b; }
.dark-popper .el-select-dropdown__item { color: #c4d8e8; font-size: 12px; }
.dark-popper .el-select-dropdown__item.is-selected, .dark-popper .el-select-dropdown__item:hover { background: #163647; color: #67d9e8; }
.dark-popper.el-popper.is-light .el-select-dropdown__list { padding: 4px; }
</style>
