<template>
  <div class="hello">
    <div v-if="validator.onUpdate">
      PSEUDO ASYNC FUNCTION IS WORKING PLEASE WAIT
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background-color: rgb(255, 255, 255); display: block; shape-rendering: auto; background-position: initial initial; background-repeat: initial initial;" width="50px" height="50px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
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
    <div :class="{'valid': validator.isValid}">
    <div>
      <label>
        {{validator.child('email').value}}
        <input :class="{'valid': validator.child('email').isValid}" v-validate="validator.child('email')">
      </label>
    </div>
    <div>
      <label>{{validator.child('tel').value}}</label>
      <label>
        <input :class="{'valid': validator.child('tel').isValid}" v-validate="validator.child('tel')">
      </label>
    </div>
  </div>
  </div>
</template>

<script lang="js">
import { validate } from '@/validator/directive';
import { create } from '@/validator/create';
import { all, email, test } from '@/validator/functions';

const resolveDelay = (x, delay) =>  {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(x);
    }, delay);
  });
};

const allDelay = {
  f: resolveDelay(all.f, 500)
};

export default {
  props: ['msg'],
  directives: {
    validate
  },
  data: () => ({
    validator: create({
      functions: [all],
      children: [
        {
          name: 'email',
          value: 'email@,asd',
          functions: [email],
        },
        {
          name: 'tel',
          value: 'tel',
          functions: [test('telephone')],
        }
      ],
    }),
  }),
  methods: {
  
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.valid {
  border: 2px solid green;
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
