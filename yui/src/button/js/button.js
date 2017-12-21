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
    TAG = 'brightcove-video',
    CSS = {
        BUTTON: 'atto_brightcove_submit',
        BUTTON_SELECT: 'atto_brightcove_select',
        FORM:   'atto_brightcove_form',
        VIDEOID: 'videoid',
        WIDTH:   'width',
        HEIGHT:  'height'
    },
    SELECTORS = {
        FORM: '.atto_brightcove_form',
        SUBMIT: '.atto_brightcove_submit',
        SELECT: '.atto_brightcove_select',
        VIDEOID: '.videoid',
        WIDTH:   '.width',
        HEIGHT:  '.height'
    },
    TEMPLATE = '' +
        '<form class="atto_form {{CSS.FORM}}">' +
        '<label for="{{CSS.VIDEOID}}">{{get_string "videoid" component}}</label>' +
        '<input class="{{CSS.VIDEOID}}" id="{{CSS.VIDEOID}}" name="{{CSS.VIDEOID}}" />' +
        '<button class="{{CSS.BUTTON_SELECT}}" name="{{CSS.BUTTON_SELECT}}" type="button">{{get_string "select" component}}</button>' +
        '<label for="{{CSS.WIDTH}}">{{get_string "width" component}}</label>' +
        '<input class="{{CSS.WIDTH}}" id="{{CSS.WIDTH}}" name="{{CSS.WIDTH}}" />' +
        '<label for="{{CSS.HEIGHT}}">{{get_string "height" component}}</label>' +
        '<input class="{{CSS.HEIGHT}}" id="{{CSS.HEIGHT}}" name="{{CSS.HEIGHT}}" />' +
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
        this.editor.delegate('click', this._handleClick, 'brightcove-video', this);
        this.editor.delegate('dblclick', this._displayDialogue, 'brightcove-video', this);

        this.addButton({
            icon: 'icon',
            iconComponent: 'atto_brightcove',
            tags: TAG,
            tagMatchRequiresAll: false,
            callback: this._displayDialogue
        });
    },

    /**
     * Handles a click on a media element.
     *
     * @method _handleClick
     * @param  {EventFacade} e
     * @private
     */
    _handleClick: function(e) {
        var medium = e.target;
        var selection = this.get('host').getSelectionFromNode(medium);

        if (this.get('host').getSelection() !== selection) {
            this.get('host').setSelection(selection);
        }
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
        dialogue.set('bodyContent', this._getDialogueContent());
        this._setSelectedData();
        dialogue.show();
    },

    /**
     * Set selected data to the Dialogue form.
     *
     * @method _setSelectedData
     * @private
     */
    _setSelectedData: function() {
        // Find the first anchor tag in the selection.
        var selectednode = this.get('host').getSelectionParentNode(),
            node,
            videoid,
            width,
            height;

        // Note this is a document fragment and YUI doesn't like them.
        if (!selectednode) {
            return;
        }

        node = this._findSelectedVideo(Y.one(selectednode));

        if (node) {
            videoid = node.getAttribute('video-id');
            width = node.getAttribute('width');
            height = node.getAttribute('height');

            if (videoid) {
                this._content.one(SELECTORS.VIDEOID).setAttribute('value', videoid);
            }

            if (width) {
                this._content.one(SELECTORS.WIDTH).setAttribute('value', width);
            }

            if (height) {
                this._content.one(SELECTORS.HEIGHT).setAttribute('value', height);
            }
        }
    },

    /**
     * Look up and down for the nearest brightcove tag in the selection.
     *
     * @method _findSelectedVideo
     * @param {Node} node The node to search under for the selected video.
     * @return {Node|Boolean} The Node, or false if not found.
     * @private
     */
    _findSelectedVideo: function(node) {
        var tagname = node.get('tagName'),
            hit, hits;

        // Direct hit.
        if (tagname && tagname.toLowerCase() === TAG) {
            return node;
        }

        // Search down but check that each node is part of the selection.
        hits = [];
        node.all(TAG).each(function(n) {
            if (!hit && this.get('host').selectionContainsNode(n)) {
                hits.push(n);
            }
        }, this);
        if (hits.length > 0) {
            return hits[0];
        }
        // Search up.
        hit = node.ancestor(TAG);
        if (hit) {
            return hit;
        }
        return null;
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
            SELECTORS: SELECTORS,
            component: COMPONENTNAME
        }));

        this._content.one(SELECTORS.SUBMIT).on('click', this._insertVideo, this);
        // this._content.one(SELECTORS.SELECT).on('click', this._selectVideoDialog, this);

        return this._content;
    },

    /**
     * Insert the Video into the editor.
     *
     * @method _insertVideo
     * @param {EventFacade} e
     * @private
     */
    _insertVideo: function(e) {
        e.preventDefault();

        // Hide the dialogue.
        this.getDialogue({
            focusAfterHide: null
        }).hide();

        var videoid =  e.currentTarget.ancestor(SELECTORS.FORM).one(SELECTORS.VIDEOID).get('value');
        var width =  e.currentTarget.ancestor(SELECTORS.FORM).one(SELECTORS.WIDTH).get('value');
        var height =  e.currentTarget.ancestor(SELECTORS.FORM).one(SELECTORS.HEIGHT).get('value');

        // Set the selection.
        this.get('host').setSelection(this._currentSelection);

        var html = '<' + TAG +' video-id="' + videoid +'"';

        if (width) {
            html = html.concat(' width="' + width + '"');
        }

        if (height) {
            html = html.concat(' height="' + height + '"');
        }

        html = html.concat('></' + TAG + '>');

        this.editor.focus();
        this.get('host').insertContentAtFocusPoint(html);
        this.markUpdated();
    },

    /**
     * Run a dialog window for selecting video.
     *
     * @method _selectVideoDialog
     * @param {EventFacade} e
     * @private
     */
    _selectVideoDialog: function(e) {
        e.preventDefault();
        alert('This feature is not implemented yet');
    }
});
