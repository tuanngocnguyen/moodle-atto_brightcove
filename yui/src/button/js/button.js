// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Brightcove button JS stuff.
 *
 * @package   atto_brightcove
 * @author    Dmitrii Metelkin (dmitriim@catalyst-au.net)
 * @copyright Catalyst IT
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Atto text editor brightcove video plugin.
 *
 * @module moodle-atto_brightcove-button
 */

var COMPONENTNAME = 'atto_brightcove',
    CSS = {
        BUTTON: 'atto_brightcove_submit',
        FORM:   'atto_brightcove_form'
    },
    INPUT = {
        VIDEOID: 'videoid',
        WIDTH:   'width',
        HEIGHT:  'height'
    },
    TEMPLATE = '' +
        '<form class="atto_form {{CSS.FORM}}">' +
        '<label for="{{INPUT.VIDEOID}}">Brightcove video ID</label>' +
        '<input class="{{INPUT.VIDEOID}}" id="{{INPUT.VIDEOID}}" name="{{INPUT.VIDEOID}}" value="{{defaultvideoid}}" />' +
        '<label for="{{INPUT.WIDTH}}">{{get_string "width" component}}</label>' +
        '<input class="{{INPUT.WIDTH}}" id="{{INPUT.WIDTH}}" name="{{INPUT.WIDTH}}" value="{{defaultwidth}}" />' +
        '<label for="{{INPUT.HEIGHT}}">{{get_string "height" component}}</label>' +
        '<input class="{{INPUT.HEIGHT}}" id="{{INPUT.HEIGHT}}" name="{{INPUT.HEIGHT}}" value="{{defaultheight}}" />' +
        '<br /><br />' +
        '<button class="{{CSS.BUTTON}}">{{get_string "insert" component}}</button>' +
        '</form>';

/**
 * Atto text editor Brightcove video plugin.
 *
 * @namespace M.atto_brightcove
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

Y.namespace('M.atto_brightcove').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    /**
     * A reference to the current selection at the time that the dialogue was opened.
     *
     * @property _currentSelection
     * @type Range
     * @private
     */
    _currentSelection: null,

    initializer: function() {
        this.addButton({
            icon: 'icon',
            iconComponent: 'atto_brightcove',
            tags: 'brightcove-video',
            tagMatchRequiresAll: false,
            callback: this._displayDialogue
        });
    },

    /**
     * Display selector.
     *
     * @method _displayDialogue
     * @private
     */
    _displayDialogue: function(e) {
        this._currentSelection = this.get('host').getSelection();

        var dialogue = this.getDialogue({
            headerContent: M.util.get_string('insertvideo', COMPONENTNAME, null),
            focusAfterHide: true
        }, true);

        // Set the dialogue content, and then show the dialogue.
        dialogue.set('bodyContent', this._getDialogueContent()).show();
    },

    /**
     * Return the dialogue content for the tool.
     *
     * @method _getDialogueContent
     * @private
     * @return {Node} The content to place in the dialogue.
     */
    _getDialogueContent: function() {
        var template = Y.Handlebars.compile(TEMPLATE);

        this._content = Y.Node.create(template({
            CSS: CSS,
            INPUT: INPUT,
            component: COMPONENTNAME
        }));

        this._content.one('.' + CSS.BUTTON).on('click', this._insertVideo, this);

        return this._content;
    },

    /**
     * Insert the Video into the editor.
     *
     * @method _insertChar
     * @param {EventFacade} e
     * @private
     */
    _insertVideo: function(e) {
        e.preventDefault();

        // Hide the dialogue.
        this.getDialogue({
            focusAfterHide: null
        }).hide();


        var videoid =  e.currentTarget.ancestor('.' + CSS.FORM).one('.' + INPUT.VIDEOID).get('value');
        var width =  e.currentTarget.ancestor('.' + CSS.FORM).one('.' + INPUT.WIDTH).get('value');
        var height =  e.currentTarget.ancestor('.' + CSS.FORM).one('.' + INPUT.HEIGHT).get('value');

        // Set the selection.
        this.get('host').setSelection(this._currentSelection);

        var html = '<brightcove-video video-id="' + videoid +'"';

        if (width) {
            html = html.concat(' width="' + width + '"');
        }

        if (height) {
            html = html.concat(' height="' + height + '"');
        }

        html = html.concat('></brightcove-video>');

        this.editor.focus();
        this.get('host').insertContentAtFocusPoint(html);
        this.markUpdated();
    }
});
