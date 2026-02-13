<?php

if (!defined('AOWOW_REVISION'))
    die('illegal access');

class EditPage extends GenericPage
{
    protected /* string */ $tpl = 'guide-edit';
    protected /* array */  $path = [6];
    protected /* int */    $tabId = 6;
    protected /* int */    $typeId = 0;
    protected /* array */  $editorFields = [];
    protected /* bool */   $save = false;

    protected /* array */ $_get = array(
        'id'  => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkInt'],
        'rev' => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkInt']
    );

    protected /* array */ $_post = array(
        'save'        => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkEmptySet'],
        'submit'      => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkEmptySet'],
        'title'       => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkTextLine'],
        'name'        => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkTextLine'],
        'description' => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkTextLine'],
        'changelog'   => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkTextBlob'],
        'body'        => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkTextBlob'],
        'locale'      => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkInt'],
        'category'    => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkInt'],
        'specId'      => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkInt'],
        'classId'     => ['filter' => FILTER_CALLBACK, 'options' => 'GenericPage::checkInt']
    );

    public function __construct($pageCall, $pageParam)
    {
        if (!User::canWriteGuide())
            $this->notFound(Lang::game('guide'), Lang::guide('notFound'));

        parent::__construct($pageCall, $pageParam);

        $this->typeId = $this->_get['id'] ?? 0;
        $this->save = isset($this->_post['save']) || isset($this->_post['submit']);
        $this->name = Lang::guide('editor');
    }

    protected function generateContent() : void
    {
        $this->editorFields = array(
            'locale' => Lang::getLocale()->value,
            'status' => GUIDE_STATUS_DRAFT,
            'category' => 0,
            'title' => '',
            'name' => '',
            'description' => '',
            'text' => '',
            'classId' => 0,
            'specId' => -1,
            'rev' => 0
        );

        if ($this->save && $this->typeId > 0)
        {
            $rev = DB::Aowow()->selectCell('SELECT `rev` FROM ?_articles WHERE `type` = ?d AND `typeId` = ?d ORDER BY `rev` DESC LIMIT 1', Type::GUIDE, $this->typeId) ?? 0;
            $rev++;

            DB::Aowow()->query('INSERT INTO ?_articles (`type`, `typeId`, `locale`, `rev`, `editAccess`, `article`) VALUES (?d, ?d, ?d, ?d, ?d, ?)',
                Type::GUIDE, $this->typeId, $this->_post['locale'], $rev, User::$groups & U_GROUP_STAFF ? User::$groups : User::$groups | U_GROUP_BLOGGER, $this->_post['body']);

            $guideData = array(
                'category'    => $this->_post['category'],
                'classId'     => $this->_post['classId'],
                'specId'      => $this->_post['specId'],
                'title'       => $this->_post['title'],
                'name'        => $this->_post['name'],
                'description' => $this->_post['description'] ?: Lang::trimTextClean((new Markup($this->_post['body']))->stripTags(), 120),
                'locale'      => $this->_post['locale'],
                'roles'       => User::$groups,
                'status'      => GUIDE_STATUS_DRAFT
            );

            DB::Aowow()->query('UPDATE ?_guides SET ?a WHERE `id` = ?d', $guideData, $this->typeId);

            if ($this->_post['submit'])
            {
                DB::Aowow()->query('UPDATE ?_guides SET `status` = ?d WHERE `id` = ?d', GUIDE_STATUS_REVIEW, $this->typeId);
                DB::Aowow()->query('INSERT INTO ?_guides_changelog (`id`, `date`, `userId`, `status`) VALUES (?d, ?d, ?d, ?d)', $this->typeId, time(), User::$id, GUIDE_STATUS_REVIEW);
            }
        }

        $this->editorFields = array(
            'locale' => $this->_post['locale'] ?? Lang::getLocale()->value,
            'status' => GUIDE_STATUS_DRAFT,
            'category' => $this->_post['category'] ?? 0,
            'title' => $this->_post['title'] ?? '',
            'name' => $this->_post['name'] ?? '',
            'description' => $this->_post['description'] ?? '',
            'text' => $this->_post['body'] ?? '',
            'classId' => $this->_post['classId'] ?? 0,
            'specId' => $this->_post['specId'] ?? -1,
            'rev' => 0
        );
    }

    protected function editorFields(string $field, bool $asInt = false) : string
    {
        return $this->editorFields[$field] ?? ($asInt ? 0 : '');
    }

    public function display(string $override = '') : never
    {
        parent::display($override);
    }
}

?>
