/**
 * jspsych-html-button-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["custom-buttons"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'custom-buttons',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      choices: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Choices',
        default: undefined,
        array: true,
        description: 'The labels for the buttons.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
      Input: {
         type: jsPsych.plugins.parameterType.STRING,
         pretty_name: 'Input',
         default: '',
         Description: 'The letter the participant selected'   
      },
      Display: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Display',
        default: '8px',
        Description: 'The letter to be put on the screen'   
      },
      Collect_data: {
        type: jsPsych.plugins.parameterType.BOOL,
        Description: 'Whether or not data will be collected for this trial',
        default: true,
        pretty_name: 'Collect data'   
      },
      reset_input: {
        type: jsPsych.plugins.parameterType.BOOL,
        Description: 'If true, the following input trial will be reset',
        default: false,
        pretty_name: 'reset input'   
      },
    }
  };

  plugin.trial = function(display_element, trial) {
    
    if (trial.reset_input === true) {
      function similar(a, b) {
        cut_input = a.slice(0, num_responses); 
        var length_a = cut_input.length;
        length_b = b.length;
        var equivalency = 0;
        var minLength = (length_a > length_b) ? length_b : length_a;
        maxLength = (length_a < length_b) ? length_b : length_a;
        for(var i = 0; i < minLength; i++) {
          if(a[i] == b[i]) {
            equivalency++;
          }
        }
        var weight = equivalency / maxLength;
        
        num_correct = weight*maxLength;
        if (weight == 1) {
          OSPAN_SCORE += num_correct;
        };
        total_correct += num_correct;
        saveInput = input;
        saveSequence = letter_sequence;
      }
      similar(input, letter_sequence);
      input = '';
      letter_sequence = '';
      submit = false;
      if (num_responses == 0) {
        cut_input = 'null';
      }
      num_responses = -1;
      end_trial();
    };
    if (submit === false && trial.reset_input === false) {
      // display stimulus
      var html = '<div id="jspsych-html-button-response-stimulus">'+trial.stimulus+'</div>';

      //display buttons
      var buttons = [];
      if (Array.isArray(trial.button_html)) {
        if (trial.button_html.length == trial.choices.length) {
          buttons = trial.button_html;
        } else {
          console.error('Error in html-button-response plugin. The length of the button_html array does not equal the length of the choices array');
        }
      } else {
        for (var i = 0; i < trial.choices.length; i++) {
          buttons.push(trial.button_html);
        }
      }
      html += '<div id="jspsych-html-button-response-btngroup">';
      for (var i = 0; i < trial.choices.length; i++) {
        var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
        html += '<div class="jspsych-html-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-html-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
      }
      html += '</div>';

      //show prompt if there is one
      if (trial.prompt !== null) {
        html += trial.prompt;
      }
      html += '<div class="absolute">' + input + '</div>'
      display_element.innerHTML = html;

      // start time
      var start_time = performance.now();

      // add event listeners to buttons
      for (var i = 0; i < trial.choices.length; i++) {
        display_element.querySelector('#jspsych-html-button-response-button-' + i).addEventListener('click', function(e){
          var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
          after_response(choice);
        });
      }

      // store response
      var response = {
        rt: null,
        button: null
      }
    };
      
    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = performance.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      if (trial.reset_input === false) {
        display_element.querySelector('#jspsych-html-button-response-stimulus').className += ' responded';
      }
      if (submit === false) {
        trial.Collect_data = true;
        num_responses++
        if (response.button == 0) {
          trial.Input = "F";
        }
        if (response.button == 1) {
          trial.Input = "H";
        }
        if (response.button == 2) {
          trial.Input = "J";
        }
        if (response.button == 3) {
          trial.Input = "K";
        }
        if (response.button == 4) {
          trial.Input = "L";
        }
        if (response.button == 5) {
          trial.Input = "N";
        }
        if (response.button == 6) {
          trial.Input = "P";
        }
        if (response.button == 7) {
          trial.Input = "Q";
        }
        if (response.button == 8) {
          trial.Input = "R";
        }
        if (response.button == 9) {
          trial.Input = "S";
        }
        if (response.button == 10) {
          trial.Input = "T";
        }
        if (response.button == 11) {
          trial.Input = "Y";
        }
        if (response.button == 13) {
          input = '';
          num_responses = -1;
        }
        if (response.button == 12) {
          trial.Input = "_";
        }
        if (response.button == 14) {
          submit = true;
        }
        else {
          input = input;
        }
        if (trial.response_ends_trial) {
          end_trial();
        }
    }
      else {
          trial.Collect_data = false;
          //input = input;
        }
    }

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();
      
      if (trial.reset_input === false) {
        // gather the data to store for the trial
        var trial_data = {
          "rt": response.rt,
          "stimulus": trial.stimulus,
          "button_pressed": response.button,
          "input": trial.Input,
          "collect_data": false,
        }
      };  
      if (trial.reset_input === true) {
        var trial_data = {
          "input": trial.Input,
          "Input_sequence": cut_input,
          "stimulus": saveSequence,
          "collect_data": true,
          "correct_letters": num_correct,
          "total_letters": length_b
        }  
      }
      
      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    }

    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-button-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };
  return plugin;
})();
