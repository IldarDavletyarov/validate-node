<template>
  <div class="hello">
    <div v-if="v.onUpdate">
      PSEUDO ASYNC FUNCTION IS WORKING PLEASE WAIT
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background-color: rgb(255, 255, 255); display: block; shape-rendering: auto; background-position: initial; background-repeat: initial;" width="50px" height="50px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <g transform="rotate(0 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.9166666666666666s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(30 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.8333333333333334s" repeatCount="indefinite"></animate>
        </rect>
      </g><g transform="rotate(60 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.75s" repeatCount="indefinite"></animate>
        </rect>
      </g><g transform="rotate(90 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.6666666666666666s" repeatCount="indefinite"></animate>
        </rect>
      </g><g transform="rotate(120 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5833333333333334s" repeatCount="indefinite"></animate>
        </rect>
      </g><g transform="rotate(150 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5s" repeatCount="indefinite"></animate>
        </rect>
      </g><g transform="rotate(180 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.4166666666666667s" repeatCount="indefinite"></animate>
        </rect>
      </g><g transform="rotate(210 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.3333333333333333s" repeatCount="indefinite"></animate>
        </rect>
      </g><g transform="rotate(240 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.25s" repeatCount="indefinite"></animate>
        </rect>
      </g><g transform="rotate(270 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.16666666666666666s" repeatCount="indefinite"></animate>
        </rect>
      </g><g transform="rotate(300 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.08333333333333333s" repeatCount="indefinite"></animate>
        </rect>
      </g><g transform="rotate(330 50 50)">
        <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#fe718d">
          <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animate>
        </rect>
      </g>
      </svg>
    </div>
    <div :class="[{'valid': v.isValid }, { 'wait': v.onUpdate}]">
      <div>
        <label>
        {{v.email.value}}
          <input :class="{'valid': v.email.isValid}" v-validate:blur.email="v">
        </label>
      </div>
      <div>
        <label>{{v.tel.value}}</label>
        <label>{{v.tel.errors}}</label>
        <label>
          <input :class="[{'valid': v.child('tel').isValid},{'wait': v.tel.onUpdate}]" v-validate.tel="v">
        </label>
      </div>
      <div>
        <label>{{v.tel.async.value}}</label>
        <label>
          <input :class="[{'valid': v.tel.async.isValid}, { 'wait': v.tel.async.onUpdate}]" v-validate.tel.async="v">
        </label>
      </div>
      <button :disabled="!v.isValid" @click="submit" >Подтвердить</button>
    </div>
  </div>
</template>

<script lang="ts">
import { validate, create, all, email, tel } from '@/validate-node';

const resolveDelay = (x: any, delay: number) =>  {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('execute promise');
      resolve(x);
    }, delay);
  });
};

export default {
  props: ['msg'],
  directives: {
    validate
  },
  data: () => ({
    v: create({
      functions: [all],
      children: [
        {
          name: 'email',
          value: 'email@someg.c',
          functions: [email],
        },
        {
          name: 'tel',
          value: '12345678901',
          functions: [tel, all],
          children: [
            {
              name: 'async',
              value: 'something',
              functions: [{
                f: (val: string) => resolveDelay({value: val==='ASYNC', errors: []},1000),
                children: []
              }],
              options: {
                linters: [
                  (v: string) => {
                    return v.toUpperCase();
                  },
                ]
              },
            }
          ]
        },
      ],
    },
       true
    ),
  }),
  methods: {
    submit() {
      // @ts-ignore
      console.log(this.v.email,this.v.tel);
    }
  }
}
</script>
<style scoped>
.valid {
  border: 2px solid green;
  border-radius: 4px;
}
.wait {
  border: 3px solid darkorange;
  border-radius: 6px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
