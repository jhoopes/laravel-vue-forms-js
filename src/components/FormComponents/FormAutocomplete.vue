<template>
  <div
    class="form-group autocomplete"
    v-on:keyup.esc="isOpen = false"
    v-on:keyup.up="previousItem"
    v-on:keyup.down="nextItem"
    :id="fieldName + '-text-field'"
    :class="{ 'has-error': form.errors.has(this.fieldConfig.value_field) }"
  >
    <label class="form-control-label" v-if="showLabel"
      ><span v-html="fieldConfig.label"></span>
      <span class="required" v-if="fieldConfig.field_extra.required"
        >&nbsp;&nbsp;(*)</span
      >
      <span
        v-if="withHelpIcon"
        :class="fieldConfig.field_extra.withIcon"
        :title="fieldConfig.field_extra.helpText"
      ></span>
    </label>
    <div class="">
      <input
        class="form-control"
        type="text"
        v-model="search"
        @input="onChange"
        @keydown.down.once="nextItem"
        @keydown.up.once="previousItem"
        @keydown.enter="onEnter"
      />
      <ul v-show="isOpen" class="autocomplete-results">
        <li
          v-for="(result, i) in results"
          :key="i"
          @click="setResult(result)"
          class="autocomplete-result"
          :class="{ 'is-active': i === arrowCounter }"
        >
          {{ result }}
        </li>
        <li
          v-if="results.length === 0 && tagging && loading === false"
          class="autocomplete-result"
          @click="createItem"
        >
          Create this {{ fieldConfig.label }}
        </li>
        <li v-if="loading === true">
          Loading... <fa-icon icon="spinner" :spin="true"></fa-icon>
        </li>
      </ul>
      <span
        class="help-block"
        v-if="form.errors.has(this.fieldConfig.value_field)"
      >
        {{ form.errors.get(this.fieldConfig.value_field, true) }}
      </span>
    </div>
    <div v-if="hasHelpText">
      <span v-html="fieldConfig.field_extra.helpText"></span>
    </div>
  </div>
</template>
<script>
import FormField from "../../mixins/FormField";
import HasOptions from "../../mixins/HasOptions";
import { debounce, get } from "lodash";
import Parser from "../../classes/jsonapi_parser";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
export default {
  name: "form-autocomplete",

  mixins: [FormField, HasOptions],

  components: {
    FaIcon: FontAwesomeIcon
  },

  props: {
    tagging: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      search: "",
      items: [],
      results: [],
      currentItem: null,
      isOpen: false,
      loading: false,
      arrowCounter: 0
    };
  },

  created() {
    this.getOptions().then(() => {
      this.setSearch();
    });
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  computed: {
    currentOptionsURL() {
      return "";
    },
    currentOptionsUrl() {
      if (this.fieldConfig.optionsURL) {
        var optionsURL = this.fieldConfig.optionsURL;
        this.fieldsToWatch.forEach(match => {
          let fieldValue = get(this.form, match[1], "");
          optionsURL = optionsURL.replace(match[0], fieldValue);
        });

        var params = JSON.parse(
          JSON.stringify(this.fieldConfig.optionsUrlParams)
        );
        params.q = this.search;

        if (!this.search && this.value) {
          params.q = this.value;
        }

        let queryString = Object.keys(params)
          .map(key => key + "=" + params[key])
          .join("&");

        optionsURL += "?" + queryString;
        return optionsURL;
      }
      return "";
    }
  },

  watch: {
    currentOptionsUrl: function() {
      this.updateOptions();
    }
  },

  methods: {
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
    onChange() {
      if (!this.currentOptionsURL) {
        this.isOpen = true;
        this.filterResults();
      } else {
        this.loading = true;
        this.isOpen = true;
      }

      if (this.search === "" || this.search === null) {
        this.$emit("input", null);
      }
    },
    filterResults() {
      if (!this.search) {
        return this.items;
      }

      this.results = this.items.filter(item => {
        if (!item) {
          return false;
        }

        return item.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
    },
    setResult(result) {
      this.search = result;
      this.isOpen = false;

      this.$emit("input", this.getValue());
    },
    previousItem() {
      if (this.arrowCounter > 0) {
        this.arrowCounter = this.arrowCounter - 1;
      }
    },
    nextItem() {
      if (this.arrowCounter < this.results.length) {
        this.arrowCounter = this.arrowCounter + 1;
      }
    },
    onEnter() {
      var result = this.results[this.arrowCounter];
      this.setResult(result);
      this.isOpen = false;
      this.arrowCounter = -1;
    },
    updateOptions: debounce(function() {
      this.getOptions();
    }, 200),
    getOptions() {
      return new Promise((resolve, reject) => {
        if (this.currentOptionsUrl.length > 0) {
          this.loading = true;
          this.apiClient
            .get(this.currentOptionsUrl)
            .then(response => {
              var options = response.data;
              if (this.jsonApi) {
                // parse the response and get the array of models
                options = Parser.parseJSONAPIResponse(
                  response.data
                ).getModels();
              }

              this.fieldConfig.options = options;
              this.loading = false;

              this.setItems();
              this.filterResults();
              resolve(options);
            })
            .catch(error => {
              window.notify.apiError(error);
              this.loading = false;
              reject(error);
            });
        } else {
          this.setItems();
        }
      });
    },
    setItems() {
      if (this.fieldConfig.optionLabelField) {
        this.items = this.fieldConfig.options.map(option => {
          return option[this.fieldConfig.optionLabelField];
        });
      } else {
        this.items = this.fieldConfig.options;
      }
    },
    setSearch() {
      if (!this.value) {
        return;
      }

      if (
        this.fieldConfig.optionValueField &&
        this.fieldConfig.optionLabelField
      ) {
        let items = this.fieldConfig.options.filter(item => {
          return item[this.fieldConfig.optionValueField] === this.value;
        });
        this.search = items[0][this.fieldConfig.optionLabelField];
      } else {
        this.search = this.value;
      }
    },
    getValue() {
      var value = null;
      if (this.fieldConfig.optionValueField) {
        value = this.fieldConfig.options.filter(item => {
          return item[this.fieldConfig.optionLabelField] === this.search;
        });
        if (value.length > 0) {
          value = value[0][this.fieldConfig.optionValueField];
        }
      } else {
        value = this.items.filter(item => {
          return item === this.search;
        })[0];
      }
      return value;
    },
    createItem() {
      if (!this.tagging) {
        return;
      }

      if (this.fieldConfig.optionsURL) {
        this.loading = true;
        var data = {};
        data[this.fieldConfig.fieldName] = this.search;
        this.apiClient
          .post(this.fieldConfig.optionsURL, data)
          .then(response => {
            this.loading = false;

            var option = response.data;
            if (this.jsonApi) {
              // parse the response and then only pull the attributes out of the model generated
              option = Parser.parseJSONAPIResponse(response.data).toJSON();
            }

            this.fieldConfig.options.push(option);
            this.setResult(option[this.fieldConfig.optionLabelField]);
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.$emit("create-tag", this.search);
      }
    }
  }
};
</script>
