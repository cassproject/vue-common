<template>
    <div class="input-field">
        <span
            v-if="range[0] === 'http://www.w3.org/2001/XMLSchema#dateTime'"
            class="input-span">
            <input
                v-model="computedText"
                type="datetime-local"
                @blur="blur">
        </span>
        <span v-else-if="options">
            <select
                v-model="computedText"
                @blur="blur">
                <option
                    v-for="item in options"
                    :key="item"
                    :value="item.val">{{ item.display }}</option>
            </select>
        </span>
        <div v-else>
            <input
                ref="language"
                class="text-input"
                v-if="computedLanguage || langString"
                v-model="computedLanguage"
                @blur="blur">
            <textarea
                ref="textarea"
                class="textarea-input"
                rows="1"
                v-model="computedText"
                @blur="blur" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'PropertyString',
    props: {
        thing: Object,
        expandedThing: Object,
        property: String,
        expandedProperty: String,
        schema: Object,
        index: null,
        langString: null,
        range: null,
        options: null
    },
    created: function() {
    },
    data: function() {
        var property = this.thing[this.property];
        if (EcArray.isArray(property)) {
            return {
                text: this.thing[this.property][this.index],
                indexInternal: this.index
            };
        } else {
            return {
                text: this.thing[this.property],
                indexInternal: null
            };
        }
    },
    computed: {
        computedText: {
            get: function() {
                if (EcObject.isObject(this.text)) {
                    if (this.text["@value"] === undefined) {
                        return null;
                    }
                    return this.text["@value"];
                }
                return this.text;
            },
            set: function(value) {
                if (EcObject.isObject(this.text)) {
                    if (this.text["@value"] !== undefined) {
                        this.text["@value"] = value;
                    }
                } else {
                    this.text = value;
                }
            }
        },
        computedLanguage: {
            get: function() {
                if (EcObject.isObject(this.text)) {
                    if (this.text["@language"] === undefined) {
                        return null;
                    }
                    return this.text["@language"];
                }
                return null;
            },
            set: function(value) {
                if (EcObject.isObject(this.text)) {
                    if (this.text["@language"] !== undefined) {
                        this.text["@language"] = value;
                    }
                }
            }
        }
    },
    watch: {
        text: function(newValue, oldValue) {
        }
    },
    methods: {
        blur: function() {
            this.$parent.update(this.text, this.indexInternal);
        }
    }
};
</script>