"use strict";

function onError(e) {
    console.error(e);
    setAttributes(inputs, "disabled", false);
}

function setAttributes(nodeList, attrName, attrValue) {
    for (let node of nodeList) {
        node[attrName] = attrValue;
    }
}

function getStored() {
    setAttributes(inputs, "disabled", true);

    browser.storage.local.get()
        .then(gotStored, onError);
}

function gotStored(data) {
    let arr = data.gamesList;

    if (arr) {
        for (let i = 0; i < arr.length; i++) {
            inputsTitle[i].value = arr[i];
        }
    }

    setAttributes(inputs, "disabled", false);
}

function saveToStore() {
    setAttributes(inputs, "disabled", true);

    let unique = new Map();

    let result = new Array();

    for (let item of inputsTitle) {
        let value = (item.value).trim().slice(0, 100);

        switch (value.length) {
            case 0:
                result.push("");
                item.style.outline = "";
                break;
            
            case 1:
            case 2:
            case 3:
            case 4:
                result.push("");
                item.style.outline = "2px solid #ff0000";
                break;

            case 5:
            default:
                if (unique.has(value)) {
                    result.push("");
                    item.style.outline = "2px solid #ff0000";
                    break;
                }
                
                unique.set(value, 1);
                result.push(value);
                item.style.outline = "";
        }
    }

    browser.storage.local.set({
        gamesList: result
    }).then(getStored, onError);
}

const inputs = document.querySelectorAll("input");
const inputsTitle = document.querySelectorAll("input[type='text']");

const inputSave = document.querySelector("input[type='button']");
inputSave.addEventListener("click", saveToStore);

getStored();

const header = document.getElementById("header");
const description = document.getElementById("description");

header.innerText = browser.i18n.getMessage("optionsHeader");
description.innerText = browser.i18n.getMessage("optionsDescription");
inputSave.value = browser.i18n.getMessage("optionsSaveButton");