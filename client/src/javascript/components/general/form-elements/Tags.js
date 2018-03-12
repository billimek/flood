import _ from 'lodash';
import {ContextMenu, Portal, FormElementAddon, Textbox} from 'flood-ui-kit';
import {injectIntl} from 'react-intl';
import React from 'react';

import CustomScrollbars from '../CustomScrollbars';
import EventTypes from '../../../constants/EventTypes';
import Search from '../../../components/icons/Search';
import UIStore from '../../../stores/UIStore';
import TorrentFilterStore from '../../../stores/TorrentFilterStore';

class Tags extends React.Component{
  contextMenuInstanceRef = null;
  contextMenuNodeRef = null;
  tagslist = [];

  constructor(props) {
    super(props);

    const tags = props.defaultValue
      || '';

    this.state = {
      tags,
      tagsList: [],
      error: null,
      isFetching: false,
      isTagsListOpen: false
    };

    this.handleWindowResize = _.debounce(this.handleWindowResize, 100);
  }


  componentDidMount() {
    UIStore.listen(EventTypes.UI_MODAL_DISMISSED, this.handleModalDismiss);
  }

  componentWillUpdate(_nextProps, nextState) {
    if (!this.state.isTagsListOpen && nextState.isTagsListOpen) {
      this.addTagsOpenEventListeners();
    } else if (this.state.isTagsListOpen && !nextState.isTagsListOpen) {
      this.removeTagsOpenEventListeners()
    }
  }

  componentWillUnmount() {
    UIStore.unlisten(EventTypes.UI_MODAL_DISMISSED, this.handleModalDismiss);
    this.removeTagsOpenEventListeners()
  }

  addTagsOpenEventListeners() {
    global.document.addEventListener('click', this.handleDocumentClick);
    global.addEventListener('resize', this.handleWindowResize);
  }

  closeTagsList = () => {
    if (this.state.isTagsListOpen) {
      this.setState({isTagsListOpen: false});
    }
  };

  getValue() {
    return this.getTags();
  }

  getTags() {
    return this.state.tags;
  }

  handleTagsChange = (event) => {
    const tags = event.target.value;
    
    if (!this.state.isTagsListOpen){
      this.setState({
        isTagsListOpen: true,
        isFetching: true
      });
    }

    if (this.props.onChange) {
      this.props.onChange(tags);
    }

    this.setState({tags});
  };

  handleTagsListButtonClick = (event) => {
    const isOpening = !this.state.isTagsListOpen;

    this.setState({
      isTagsListOpen: isOpening,
      isFetching: isOpening
    });
  };

  handleTagClick = tag => {
    const currentTagsValue = this.state.textboxRef.value;
    const completedTags = currentTagsValue.slice(0, currentTagsValue.lastIndexOf(',') + 1);
    const newTags = `${completedTags?completedTags+' ':''}${tag}, `;

    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.textboxRef.value = newTags;
    this.setState({tags: newTags});
  };

  handleDocumentClick = () => {
    this.closeTagsList();
  };

  handleModalDismiss = () => {
    this.closeTagsList();
  };

  handleWindowResize = () => {
    this.closeTagsList();
  };

  handleKeyPress = (event) => {
    if (event.keyCode === 9){
      const currentTagsValue = this.state.textboxRef.value;
      const newTag = currentTagsValue.slice(currentTagsValue.lastIndexOf(',') + 1).trim();

      if (newTag){
        event.preventDefault();
        if (this.tagsList[0]){
          this.handleTagClick(this.tagsList[0]);
        } else {
          this.handleTagClick(newTag);
        }
      } else {
        this.closeTagsList();
      }
    }
  }

  removeTagsOpenEventListeners() {
    global.document.removeEventListener('click', this.handleDocumentClick);
    global.removeEventListener('resize', this.handleWindowResize);
  }

  setTextboxRef = (ref) => {
    if (this.state.textboxRef !== ref) {
      this.setState({textboxRef: ref});
    }
  };

  toggleOpenState = () => {
    this.setState({
      isTagsListOpen: !this.state.isTagsListOpen
    });
  };

  getTagsList(){
    const allTags = TorrentFilterStore.getTorrentTagCount();
    delete allTags.all;
    delete allTags.untagged;

    const currentTagsValue = this.state.textboxRef ? this.state.textboxRef.value : '';
    const searchTerm = currentTagsValue.slice(currentTagsValue.lastIndexOf(',') + 1).trim();
    const currentTags = currentTagsValue ? currentTagsValue.split(',').map( (element) => element.trim()) : [];

    const tagsList = Object.keys(allTags).filter((element) => {
      return (currentTags.indexOf(element.trim()) === -1);
    }).filter( (element) => {
      return (element.indexOf(searchTerm.trim()) !== -1);
    });
    this.tagsList = tagsList;

    const tagsListElements = tagsList.map((tag) => {
      return(
        <li
          className="filesystem__directory-list__item"
          key={tag}
          onClick={() => this.handleTagClick(tag)}
        >
            {tag}
        </li>
      );
    });
    return tagsListElements;
  }

  render() {
    let tagsList = this.getTagsList()
    return (
      <div 
        style={{width: 'inherit'}}
        onKeyDown={this.handleKeyPress}
      >
        <Textbox
          addonPlacement="after"
          defaultValue={this.state.tags}
          id={this.props.id}
          label={this.props.label}
          onChange={this.handleTagsChange}
          onClick={event => event.nativeEvent.stopImmediatePropagation()}
          placeholder={this.props.placeholder}
          setRef={this.setTextboxRef}
          width="auto"
        >
          <FormElementAddon onClick={this.handleTagsListButtonClick}>
            <Search />
          </FormElementAddon>
          <Portal>
            <ContextMenu
              in={this.state.isTagsListOpen}
              onClick={event => event.nativeEvent.stopImmediatePropagation()}
              overlayProps={{isInteractive: false}}
              padding={false}
              ref={ref => this.contextMenuInstanceRef = ref}
              setRef={ref => this.contextMenuNodeRef = ref}
              scrolling={false}
              triggerRef={this.state.textboxRef}
            >
              <CustomScrollbars
                autoHeight={true}
                autoHeightMin={0}
                autoHeightMax={
                  this.contextMenuInstanceRef
                  && this.contextMenuInstanceRef.dropdownStyle
                  && this.contextMenuInstanceRef.dropdownStyle.maxHeight
                }
              >
                <div className="filesystem__directory-list context-menu__items__padding-surrogate">
                  {tagsList}
                </div>
              </CustomScrollbars>
              {/*<FilesystemBrowser
                directory={this.state.tags}
                intl={this.props.intl}
                maxHeight={
                  this.contextMenuInstanceRef
                  && this.contextMenuInstanceRef.dropdownStyle
                  && this.contextMenuInstanceRef.dropdownStyle.maxHeight
                }
                onDirectorySelection={this.handleDirectorySelection}
              />*/}
            </ContextMenu>
          </Portal>
        </Textbox>
      </div>
    );
  }
}

export default injectIntl(Tags, {withRef: true});
