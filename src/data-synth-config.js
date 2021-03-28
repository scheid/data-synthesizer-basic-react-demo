
import {DataSynthUtil} from 'data-synthesizer-basic';
import { personNames } from 'data-synthesizer-common-lists';


/*
 Sample Data Synthesizer Configuration Object
 This config object defines everything about how your data set will be created.
 to create calculated fields: if you want to generate a field based on some function of a raw field, then
    supply a function name after the field name value in the 'name' field, separated by a colon.
   for example, if you want to create a field value that is a hash of another field, you might do:
   name: 'myField:myHashingFunction',
   where, myHashingFunction takes a single argument that each field value will be passed into. your function
   should return the final value you want to use for that field. e.g.,:
   function myHashingFunction(val) {
      return makeHash(val);
   }
   The function should be either part of or visible to the data generation class at runtime. (or make function  part of config object?)
*/

let DataSynthConfig = {

    recordsToGenerate: 150,
    seed: 3118561,  // seed is only defined at root level; to change data values generated, change the seed.


    // NOTE: currently, these functions are only visible at the hierarchy level that it is defined.
    // not visible from child/nested objects.
    valueFormattingFunctions: {

        uCase: (val) => {
            return val.toUpperCase();
        },

        formatColor: (name) =>  {

            return 'Favorite color is ' + name;
        },

        // values returned as doubles may not need to be displayed with all of the decimal places.
        formatWeight: (val) => {
            return Math.round(val) ;
        },

        makeHeight(val) {
            return Math.round(val + 55);
        }


    },


    fields: [
        {
            name: 'id',
            type: DataSynthUtil.UNIQUE_ID_AUTOINCREMENT
        },
        {
            name: 'uuid',
            type: DataSynthUtil.UNIQUE_ID_UUID
        },


        {
            // this field value will be an object or array of child values.
            // the 'config' object specified here has the exact same structure as the main, root config object.
            // however you do not specify a seed with child configs.
            // the DataSynthUtil.OBJECT type allows for any number of nested levels in the generated data.
            //   you can nest OBJECT types within OBJECT types
            name: 'personPets',
            type: DataSynthUtil.OBJECT,
            config: { // config specifies how to generate the child object fields
                recordsToGenerate: 1,

                fields: [
                    {
                        name: 'hasCat',
                        type: DataSynthUtil.RANDOM_LIST_UNIFORM,
                        list: [true, false]
                    },
                    {
                        name: 'hasDog',
                        type: DataSynthUtil.RANDOM_LIST_UNIFORM,
                        list: [true, false]
                    },
                    {
                        name: 'hasFish',
                        type: DataSynthUtil.RANDOM_LIST_UNIFORM,
                        list: [true, false]
                    }
                ]
            }
        },


        {
            // step through each item in the list sequentially, and if more records than list items,
            // then start over at beginning of list once it reaches end.
            name: 'beans_sequence',
            type: DataSynthUtil.SEQUENCE_LIST,
            list: ['black beans', 'black-eyed peas', 'borlotti bean', 'broad beans', 'chickpeas', 'green beans', 'kidney beans', 'lentils']
        },

        {

            // you can assign multiple field values simultaneously; really this would only be done when sourcing from lists.
            // doesn't make much sense with numeric based values.

            // this type of assignment can be handy when you have a list and always want values assigned from that list together.
            // in this example, we have first and last names, and first and last name from the source list will always be paired together
            // in the resulting dataset.

            // if your list is an array of objects and you want to select multiple field values from a single randomly chosen object
            //  then use an array as the name value here.
            //  then, the listObjectFieldName should specify (in the same order) the randomly selected list object fields you want to assign to the field names in the name array
            // the name of another field in this array that you want to choose the same randomly chosen array element from.
            // assumes you are choosing from an object;
            //  for example if you have an array of objects of first and last names, you may want to randomly select an object
            //  and assign the first and last name fields of that object to two different fields here.
            name: ['personFirstName', 'personLastName:uCase'],
            list: personNames,
            listObjectFieldName: ['firstName', 'lastName'],  // the name of the fields to use from the object in the array of objects defined in 'list'
            type: DataSynthUtil.RANDOM_LIST_UNIFORM

        },

        {
            // Note that if you have a list of objects, like the person names list, and you treat it simply, like this, just a simple field
            // assignment, then the entire person name list object will be assigned; the individual list object containing both the first and last name
            // this can be useful in some cases. It especially gives you flexibility in using your own list and how you can assign values.
            // in the above assignment, we are breaking out the first and last names and assigning each to separate fields. here we just assign
            // an entire randomly selected object to the field value.
            name: 'personName',
            list: personNames,
            type: DataSynthUtil.RANDOM_LIST_UNIFORM

        },

        {
            name: 'dummyVar',
            type: DataSynthUtil.RANDOM_NUMERIC_RANGE_UNIFORM,

            // temporary would only be used when you are using calculated variables, and you need a (temporary) variable
            // to be generated for the sole purpose of being used in the creation of the calculated value. For example, you may
            // use the temporary variable along with other non-temporary values in the same record to create the calculated value.
            // temporary variables will not be returned in the final dataset.
            temporary: true

        },

        // calcuated fields are based solely off of values for other fields in the same record. no value is generated by default
        {
            name: 'firstAndLastName',

            // a field type of CALCULATED tells the generator to delay assigning this until all other fields in the record are assigned.
            type: DataSynthUtil.CALCULATED,

            // this will only be used on calculated fields; if any of your calculated fields have values that depend
            // on other calculated fields, then you can specify a calculation order; the fields will be calculated starting at the lowest value.
            // For example, you may specify a field with a calculatedOrder of 2, that depends on the value from a field with calculatedOrder of 1,
            // because 1 will be calculated first.
            calculatedOrder: 1,

            // this is sort of a nonsense example, that just combines the person first and last name into a string and
            //  uses that as the field value.


            // 'fn' specifies the calculation function. the return value from this determines the field value.
            // the entire data record will be passed into this function (as an object), as the first parameter so you can calulate this
            // field's value based off any of the other variable values.
            // the second parameter will contain the entire dataset up to that point (an array of objects),
            // which allows you to create calculated values based on other records in the dataset.
            // the third argument is array index of the current record in the overall dataset,
            // this index value can be convenient for example if you want to refer to a relative row/record, e.g.,
            // the previous record would be index i - 1 (assuming you name the parameter 'i')

            // the record will be an object with the field names and assigned values.
            // this particular example is rather silly, but just shows how you can use a hidden variable in a
            // calculated field; the hidden variable 'dummyVar' will be removed in the final dataset.
            fn: (rec, dataset, i) => { if (rec.dummyVar > 0.5) { return rec.personFirstName + ' ' + rec.personLastName; } }
        },

        /*
        {
          name: 'weight_lbs:formatWeight',
          type: DataSynthUtil.RANDOM_NUMERIC_RANGE_NORMAL,
          mean: 190,
          stDev: 10
        },
        */
        { name: 'weight_lbs:formatWeight',
            type: DataSynthUtil.RANDOM_NUMERIC_RANGE_NORMAL,
            mean: 190,
            stDev: 10
        },

        // weight is not really exponentially distributed; just using as an example here.
        { name: 'height_inches:makeHeight',
            type: DataSynthUtil.RANDOM_NUMERIC_RANGE_EXPONENTIAL,
            lambda: 0.4
        },

        // shows how to use a calculated field to get BMI from two other generated fields.
        // you could also use a calculated field to work backwards, to calculate either weight or height to ensure BMI was in a particular range.
        {
            name: 'bmi',
            type: DataSynthUtil.CALCULATED,
            fn: (rec, dataset, i) => { return (703 * rec.weight_lbs) / Math.pow(rec.height_inches, 2); }
        },


        {
            name: 'dateCreated',
            type: DataSynthUtil.DATE_IN_PAST_RANGE,
            minDaysAgo: 0,
            maxDaysAgo: 7
        },
        {
            name: 'favoriteColor:formatColor',
            type: DataSynthUtil.RANDOM_LIST_WEIGHTED,
            list: ['blue', 'green', 'yellow', 'red'],
            // these weights means 30% of the people (records) will have blue, 20% will have green, 20% yellow, and 30% red
            weights: [0.30, 0.20, 0.20, 0.30]
        },
        {
            name: 'bestFriendName',
            type: DataSynthUtil.RANDOM_LIST_UNIFORM,
            list: ['Juliet G. Brock', 'Bradley Z. Duran', 'Kelsie G. Deleon', 'Jack C. Rios', 'Candice I. Meyer', 'Ursa L. Trujillo']
        },
        {
            name: 'otherFriendsName',
            type: DataSynthUtil.N_RANDOM_ITEMS_FROM_LIST,
            itemCount: 3,
            list: ['Juliet G. Brock', 'Bradley Z. Duran', 'Kelsie G. Deleon', 'Jack C. Rios', 'Candice I. Meyer', 'Ursa L. Trujillo']
        },

        {
            name: 'longText',
            type: DataSynthUtil.LOREM_IPSUM,
            singleSentence: false,
            minParagraphs: 1,
            maxParagraphs: 3
        }

    ]


};

export default DataSynthConfig;
