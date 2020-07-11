/*
 * **************************************************************************************
 *
 * Dateiname:                 settings.js
 * Projekt:                   foe-chrome
 *
 * erstellt von:              Daniel Siekiera <daniel.siekiera@gmail.com>
 * erstellt am:	              22.12.19, 14:31 Uhr
 * zuletzt bearbeitet:       22.12.19, 14:31 Uhr
 *
 * Copyright © 2019
 *
 * **************************************************************************************
 */

let Settings = {

	/**
	 * Settings
	 */
	Preferences: null,

	/**
	 * Tab groups
	 */
	BoxGroups: [
		'About',
		'Sending',
		'Boxes',
		'Extension'
	],

	/**
	 * load the settings from the json
	 *
	 * @param start
	 * @constructor
	 */
	Init: (start = true) => {
		Settings.LoadConfig((response) => {
			Settings.Preferences = response;
		});
	},


	LoadConfig: (callback)=> {
		fetch(
			`${extUrl}js/web/settings/config/config.json`
		).then(response => {
			if (response.status === 200) {
				response.json().then(callback);
			}
		});
	},


	/**
	 * Box initiieren
	 */
	BuildBox: ()=> {
		if( $('#SettingsBox').length < 1 ){

			// CSS in den DOM prügeln
			HTML.AddCssFile('settings');

			HTML.Box({
				id: 'SettingsBox',
				title: i18n('Boxes.Settings.Title'),
				auto_close: true
			});

		} else {
			HTML.CloseOpenBox('SettingsBox');
		}

		Settings.BuildBody();
	},


	/**
	 * Box zusammen setzen
	 *
	 */
	BuildBody: ()=> {

		let parentLis = [],
			div = [],
			content;

		for(let i = 0; i < Settings.BoxGroups.length; i++)
		{
			let g = Settings.BoxGroups[i],
				grps = Settings.Preferences.filter((x) => x['group'] === g),
				subcontent,
				cnt = 1,
				childLis = [],
				childDivs = [];

			parentLis.push(`<li><a href="#tab-${i}"><span>${i18n('Settings.Tab.' + g)}</span></a></li>`);

			for(let x in grps)
			{
				if(!grps.hasOwnProperty(x)){
					break;
				}

				let d = grps[x],
					status = d['status'],
					button = d['button'],
					c = $('<div />').addClass('item'),
					cr = $('<div />').addClass('item-row'),
					ct = $('<h2 />'),
					cd = $('<div />').addClass('desc'),
					cs = $('<div />').addClass('setting').append(
						$('<span />').addClass('check').append(
							$('<span />').addClass('toogle-word')
						).append(
							$('<input class="setting-check game-cursor" type="checkbox" />')
						)
					);

				let s = localStorage.getItem(d['name']);

				if(s !== null){
					status = JSON.parse(s);
				}

				if(d['callback'] !== undefined) {
					cs.html( Settings[d['callback']]() );

				}
				else if(status === undefined){
					let b = $('<span />').addClass('button-wrapper').append(
						$('<button class="btn-default" id="${button}" onclick="Settings.' + button +  '()">' + i18n(`Settings.${d['name']}.Button`) + '</button>')
					);

					cs.html(b);
				}

				cd.html(i18n(`Settings.${d['name']}.Desc`));
				ct.text(i18n(`Settings.${d['name']}.Title`));
				cs.find('input.setting-check').attr('data-id', d['name']);
				if(status){
					cs.find('input.setting-check').attr('checked', '');
				}
				cs.find('.check').addClass(status ? '' : 'unchecked');
				cs.find('.toogle-word').text( status ? i18n('Boxes.Settings.Active') : i18n('Boxes.Settings.Inactive') );

				childLis.push(`<li><a href="#subtab-${cnt}">${i18n('Settings.Entry.' + d['name'])}</a></li>`);

				let h = c.append( cr.append(ct, cd, cs));
				childDivs.push('<div id="subtab-' + cnt + '" class="sub-tab">' + h.html() + '</div>');

				cnt++;
			}

			subcontent = 	`<div class='tabs-sub settings-sub'>`;
			subcontent += 		`<ul class='vertical'>${childLis.join('')}</ul>`;
			subcontent += 		childDivs.join('');
			subcontent += 	`</div>`;

			div.push(`<div id='tab-${i}' class="settings-wrapper">${subcontent}</div>`);
		}

		content = `<div class='tabs settings'>`;
		content += 		`<ul class='horizontal'>${parentLis.join('')}</ul>`;
		content += 		div.join('');
		content += `</div>`;

		// wait for html in the DOM
		$('#SettingsBoxBody').html(content).promise().done(function(){
			// init Tabslet
			$('.settings').tabslet();
			$('.settings-sub').tabslet();
		});


		$('#SettingsBoxBody').on('click', 'input.setting-check', function(){
			Settings.StoreSettings($(this));
		});
	},


	/**
	 * Beim Klick speichern
	 *
	 * @param el
	 * @param changeText
	 */
	StoreSettings: (el, changeText = true)=> {
		let id = $(el).data('id'),
			v = $(el).prop('checked');

		localStorage.setItem(id, v);

		if(changeText === false){
			return;
		}

		$(el).prev().text( v === true ? i18n('Boxes.Settings.Active') : i18n('Boxes.Settings.Inactive') );

		if(v === true){
			$(el).closest('span.check').removeClass('unchecked');
		} else {
			$(el).closest('span.check').addClass('unchecked');
		}
	},


	/**
	 * Gibt den Status aus dem localStorage oder den Settings zurück
	 *
	 * @param name
	 * @returns {any}
	 */
	GetSetting: (name)=> {
		let s = localStorage.getItem(name);

		if(s !== null){
			return JSON.parse(s);

		} else {

			if(Settings.Preferences === null){

				Settings.LoadConfig((response) => {
					Settings.Preferences = response;

					return Settings.Preferences.find(itm => itm['name'] === name)['status'];
				});

			} else {
				return Settings.Preferences.find(itm => itm['name'] === name)['status'];
			}
		}
	},


	/**
	 * Version number and Player Info 
	 *
	 * @returns {string}
	 */
	VersionInfo: ()=> {
		return '<dl class="info-box">' +
					'<dt>' + i18n('Settings.Version.Title') + '</dt><dd>' + extVersion + '</dd>' +
					'<dt>' + i18n('Settings.Version.PlayerId') + '</dt><dd>' + ExtPlayerID + '</dd>' +
					'<dt>' + i18n('Settings.Version.GuildId') + '</dt><dd>' + ExtGuildID + '</dd>' +
					'<dt>' + i18n('Settings.Version.World') + '</dt><dd>' + ExtWorld + '</dd>' +
				'</dl>';
	},


	/**
	 * General Information	 
	 *
	 * @returns {string}
	 */
	About: ()=> {
		return  '<hr>'+
				'<h2>'+i18n('Settings.About.TranslateTitle')+'</h2>'+
				'<p>'+i18n('Settings.About.TranslateDesc')+' <a href="http://i18n.foe-helper.com/" target="_blank">Weblate</a></p>'+
				'<hr>'+
				'<h2>'+i18n('Settings.About.RatingTitle')+'</h2>'+
				'<p>'+i18n('Settings.About.RatingDesc')+'</p>';
	},


	/**
	 * Help list
	 *
	 * @returns {string}
	 */
	Help: ()=> {
		return '<ul class="helplist">' + 
					'<li><a href="https://foe-rechner.de" target="_blank"><span class="website">&nbsp;</span>' + i18n('Settings.Help.Website') + '</a></li>' +
					'<li><a href="https://forum.foe-rechner.de/" target="_blank"><span class="forums">&nbsp;</span>' +	i18n('Settings.Help.Forums') + '</a></li>' +
					'<li><a href="https://discord.gg/ba5RBb" target="_blank"><span class="discord">&nbsp;</span>' + i18n('Settings.Help.Discord') + '</a></li>' +
					'<li><a href="https://github.com/dsiekiera/foe-helfer-extension/issues" target="_blank"><span class="github">&nbsp;</span>' +	i18n('Settings.Help.Github') + '</a></li>' +
				'</ul>';
	},


	/**
	 * Resets all Box Coordinated to the default values
	 *
	 */
	ResetBoxCoords: ()=>{
		$.each(localStorage, function(key, value){
			if(key.toLowerCase().indexOf('cords') > -1){
				localStorage.removeItem(key);
			}
		});

		$('#ResetBoxCoords').addClass('btn-green');

		setTimeout(()=>{
			$('#ResetBoxCoords').removeClass('btn-green');
		}, 2000)
	},


	/**
	 * Language switcher
	 *
	 * @returns {string}
	 */
	LanguageDropdown: ()=>{
		let dp = [];

		dp.push('<select class="setting-dropdown" id="change-lang">');

		for(let iso in Languages.PossibleLanguages)
		{
			if (!Languages.PossibleLanguages.hasOwnProperty(iso)){
				break;
			}

			dp.push('<option value="' + iso + '"' + (MainParser.Language === iso ? ' selected': '') + '>' + Languages.PossibleLanguages[iso] + '</option>');
		}

		dp.push('</select>');

		$('#SettingsBoxBody').on('change', '#change-lang', function(){
			let uLng = $(this).val();

			localStorage.setItem('user-language', uLng);

			location.reload();
		});

		return dp.join('');
	},


	/**
	 *	Erzeugt in Input Feld
	 *
	 * @returns {null|undefined|jQuery}
	 */
	MenuInputLength: ()=> {
		let ip = $('<input />').addClass('setting-input').attr({
					type: 'number',
					id: 'menu-input-length',
					step: 1,
					min: 2
				}),
			value = localStorage.getItem('MenuLength');

		if(null !== value){
			ip.val(value);
		}

		$('#SettingsBox').on('keyup', '#menu-input-length', function(){
			let value = $(this).val();

			if(value > 0){
				localStorage.setItem('MenuLength', value);
			} else {
				localStorage.removeItem('MenuLength');
			}

			_menu.SetMenuHeight(true);
		});

		return ip;
	}
};
